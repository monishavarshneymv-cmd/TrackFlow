package com.trackflow.dto;

import com.trackflow.entity.Trip;
import com.trackflow.entity.TripStatus;
import java.time.LocalDateTime;

public class TripResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleNumber;
    private Long driverId;
    private String driverName;
    private String source;
    private String destination;
    private LocalDateTime startDate;
    private LocalDateTime expectedEndDate;
    private TripStatus status;

    public TripResponse() {
    }

    public TripResponse(Long id, Long vehicleId, String vehicleNumber, Long driverId,
                        String driverName, String source, String destination,
                        LocalDateTime startDate, LocalDateTime expectedEndDate, TripStatus status) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.vehicleNumber = vehicleNumber;
        this.driverId = driverId;
        this.driverName = driverName;
        this.source = source;
        this.destination = destination;
        this.startDate = startDate;
        this.expectedEndDate = expectedEndDate;
        this.status = status;
    }

    public static TripResponse fromEntity(Trip trip) {
        if (trip == null) return null;
        return new TripResponse(
                trip.getId(),
                trip.getVehicle() != null ? trip.getVehicle().getId() : null,
                trip.getVehicle() != null ? trip.getVehicle().getVehicleNumber() : null,
                trip.getDriver() != null ? trip.getDriver().getId() : null,
                trip.getDriver() != null ? trip.getDriver().getName() : null,
                trip.getSource(),
                trip.getDestination(),
                trip.getStartDate(),
                trip.getExpectedEndDate(),
                trip.getStatus()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getExpectedEndDate() {
        return expectedEndDate;
    }

    public void setExpectedEndDate(LocalDateTime expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }
}
