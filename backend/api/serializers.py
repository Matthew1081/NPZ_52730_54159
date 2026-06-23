from rest_framework import serializers
from .models import Transaction
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError('Nazwa użytkownika musi mieć minimum 3 znaki.')
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Ta nazwa użytkownika jest już zajęta.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ten adres e-mail jest już zarejestrowany.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class TransactionSerializer(serializers.ModelSerializer):
    ALLOWED_CURRENCIES = ('PLN', 'USD', 'EUR')
    ALLOWED_CATEGORIES = ('Jedzenie', 'Praca', 'Rozrywka', 'Inne')

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Kwota musi być większa od zera.')
        if value > 99999999.99:
            raise serializers.ValidationError('Kwota jest zbyt duża (maksymalnie 99 999 999,99).')
        return value

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Tytuł musi mieć minimum 2 znaki.')
        return value

    def validate_currency(self, value):
        if value not in self.ALLOWED_CURRENCIES:
            raise serializers.ValidationError(
                f'Nieobsługiwana waluta. Dozwolone: {", ".join(self.ALLOWED_CURRENCIES)}.'
            )
        return value

    def validate_category(self, value):
        if value not in self.ALLOWED_CATEGORIES:
            raise serializers.ValidationError(
                f'Nieznana kategoria. Dozwolone: {", ".join(self.ALLOWED_CATEGORIES)}.'
            )
        return value

    def validate_type(self, value):
        allowed = ('income', 'expense')
        if value not in allowed:
            raise serializers.ValidationError(
                f'Nieprawidłowy typ transakcji. Dozwolone: {", ".join(allowed)}.'
            )
        return value
