from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated 
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    
    permission_classes = [IsAuthenticated] 
    queryset = Transaction.objects.all().order_by('-date', '-created_at')
    serializer_class = TransactionSerializer