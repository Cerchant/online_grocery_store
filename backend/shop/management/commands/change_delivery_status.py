from django.core.management.base import BaseCommand
from django.utils.timezone import now
from time import sleep
from shop.models import Delivery, DeliveryStatus

class Command(BaseCommand):
    help = "Смена статусов доставки каждые 15 секунд"

    def handle(self, *args, **kwargs):
        while True:
            deliveries = Delivery.objects.exclude(delivery_status__status="Delivered")
            for delivery in deliveries:
                if delivery.delivery_status.status == "Collecting":
                    delivery.delivery_status = DeliveryStatus.objects.get(status="Delivering")
                elif delivery.delivery_status.status == "Delivering":
                    delivery.delivery_status = DeliveryStatus.objects.get(status="Delivered")
                    delivery.delivered_at = now()
                delivery.save()
            sleep(15)
