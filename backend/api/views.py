import logging
from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Transaction
from .serializers import TransactionSerializer, UserSerializer

logger = logging.getLogger('api')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info("Nowy użytkownik zarejestrowany: %s", user.username)
        return Response(
            {
                'success': True,
                'message': 'Konto zostało utworzone pomyślnie.',
                'user': {
                    'username': user.username,
                    'email': user.email,
                }
            },
            status=status.HTTP_201_CREATED
        )


class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        logger.info(
            "Transakcja utworzona: '%s' przez %s",
            serializer.instance.title,
            self.request.user.username
        )

    def perform_update(self, serializer):
        serializer.save()
        logger.info(
            "Transakcja zaktualizowana: id=%s przez %s",
            serializer.instance.id,
            self.request.user.username
        )

    def perform_destroy(self, instance):
        logger.info(
            "Transakcja usunięta: '%s' (id=%s) przez %s",
            instance.title,
            instance.id,
            self.request.user.username
        )
        instance.delete()

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return Response(
                {'success': False, 'error': 'Transakcja nie została znaleziona.'},
                status=status.HTTP_404_NOT_FOUND
            )
        self.perform_destroy(instance)
        return Response(
            {'success': True, 'message': 'Transakcja została usunięta.'},
            status=status.HTTP_200_OK
        )
