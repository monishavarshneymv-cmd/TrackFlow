package com.trackflow.dto;

import com.trackflow.entity.DeliveryStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class DeliveryRequest {

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotNull(message = "Scheduled date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledDate;

    private DeliveryStatus status;

    public DeliveryRequest() {
    }

    public DeliveryRequest(String trackingNumber, Long tripId, String customerName,
                           String deliveryAddress, LocalDateTime scheduledDate, DeliveryStatus status) {
        this.trackingNumber = trackingNumber;
        this.tripId = tripId;
        this.customerName = customerName;
        this.deliveryAddress = deliveryAddress;
        this.scheduledDate = scheduledDate;
        this.status = status;
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
