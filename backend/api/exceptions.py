import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404

logger = logging.getLogger('api')


def custom_exception_handler(exc, context):
    view = context.get('view', None)
    request = context.get('request', None)

    logger.error(
        "Exception in %s: %s",
        view.__class__.__name__ if view else 'Unknown',
        str(exc),
        exc_info=True,
        extra={
            'request_path': request.path if request else 'Unknown',
            'request_method': request.method if request else 'Unknown',
            'user': str(request.user) if request else 'Anonymous',
        }
    )

    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'status_code': response.status_code,
        }

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_data['error'] = str(response.data['detail'])
            else:
                error_data['error'] = 'Błąd walidacji danych.'
                error_data['details'] = response.data
        elif isinstance(response.data, list):
            error_data['error'] = response.data[0] if response.data else 'Nieznany błąd.'
        else:
            error_data['error'] = str(response.data)

        response.data = error_data
        return response

    if isinstance(exc, DjangoValidationError):
        return Response({
            'success': False,
            'status_code': 400,
            'error': 'Błąd walidacji danych.',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else {'non_field_errors': exc.messages},
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'success': False,
        'status_code': 500,
        'error': 'Wewnętrzny błąd serwera. Spróbuj ponownie później.',
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
