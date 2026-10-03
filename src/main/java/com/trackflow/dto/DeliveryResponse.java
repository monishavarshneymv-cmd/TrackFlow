package com.trackflow.dto;

import com.trackflow.entity.Delivery;
import com.trackflow.entity.DeliveryStatus;
import java.time.LocalDateTime;

public class DeliveryResponse {

    private Long id;
    private String trackingNumber;
    private Long tripId;
    private String customerName;
    private String deliveryAddress;
    private LocalDateTime scheduledDate;
    private DeliveryStatus status;

    public DeliveryResponse() {
    }

    public DeliveryResponse(Long id, String trackingNumber, Long tripId, String customerName,
                            String deliveryAddress, LocalDateTime scheduledDate, DeliveryStatus status) {
        this.id = id;
        this.trackingNumber = trackingNumber;
        this.tripId = tripId;
        this.customerName = customerName;
        this.deliveryAddress = deliveryAddress;
        this.scheduledDate = scheduledDate;
        this.status = status;
    }

    public static DeliveryResponse fromEntity(Delivery delivery) {
        if (delivery == null) return null;
        return new DeliveryResponse(
                delivery.getId(),
                delivery.getTrackingNumber(),
                delivery.getTrip() != null ? delivery.getTrip().getId() : null,
                delivery.getCustomerName(),
                delivery.getDeliveryAddress(),
                delivery.getScheduledDate(),
                delivery.getStatus()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
}
