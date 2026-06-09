import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Create or reset the Django superuser from ADMIN_USERNAME and ADMIN_PASSWORD. "
        "Runs automatically during Render deploy — no Shell access required."
    )

    def handle(self, *args, **options):
        user_model = get_user_model()
        username = os.environ.get("ADMIN_USERNAME", "").strip()
        password = os.environ.get("ADMIN_PASSWORD", "").strip()
        email = os.environ.get("ADMIN_EMAIL", f"{username or 'admin'}@example.com").strip()
        reset_password = os.environ.get("ADMIN_RESET_PASSWORD", "").lower() == "true"

        if not username or not password:
            if user_model.objects.filter(is_superuser=True).exists():
                self.stdout.write("Superuser exists. Skipping admin bootstrap.")
                return
            self.stdout.write(
                self.style.WARNING(
                    "No superuser found. Set ADMIN_USERNAME and ADMIN_PASSWORD in Render "
                    "Environment, then redeploy (no Shell needed)."
                )
            )
            return

        existing = user_model.objects.filter(username=username, is_superuser=True).first()
        if existing:
            if reset_password:
                existing.set_password(password)
                existing.save(update_fields=["password"])
                self.stdout.write(self.style.SUCCESS(f"Reset password for superuser '{username}'."))
            else:
                self.stdout.write(f"Superuser '{username}' already exists. Skipping.")
            return

        if user_model.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING(
                    "A different superuser already exists. Set ADMIN_USERNAME to that account "
                    "and ADMIN_RESET_PASSWORD=true to reset its password, then redeploy."
                )
            )
            return

        user_model.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}'."))
