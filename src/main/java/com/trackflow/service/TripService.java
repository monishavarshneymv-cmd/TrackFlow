package com.trackflow.service;

import com.trackflow.dto.TripRequest;
import com.trackflow.dto.TripResponse;
import com.trackflow.entity.Driver;
import com.trackflow.entity.Trip;
import com.trackflow.entity.TripStatus;
import com.trackflow.entity.Vehicle;
import com.trackflow.exception.BadRequestException;
import com.trackflow.exception.DriverNotFoundException;
import com.trackflow.exception.TripNotFoundException;
import com.trackflow.exception.VehicleNotFoundException;
import com.trackflow.repository.DriverRepository;
import com.trackflow.repository.TripRepository;
import com.trackflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public TripService(TripRepository tripRepository,
                       VehicleRepository vehicleRepository,
                       DriverRepository driverRepository) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    public TripResponse createTrip(TripRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new DriverNotFoundException("Driver not found with id: " + request.getDriverId()));

        if (request.getExpectedEndDate() != null && request.getStartDate() != null) {
            if (request.getExpectedEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("Expected end date cannot be earlier than start date");
            }
        }

        Trip trip = new Trip(
                vehicle,
                driver,
                request.getSource(),
                request.getDestination(),
                request.getStartDate(),
                request.getExpectedEndDate(),
                request.getStatus() != null ? request.getStatus() : TripStatus.PLANNED
        );

        Trip saved = tripRepository.save(trip);
        return TripResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(TripResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + id));
        return TripResponse.fromEntity(trip);
    }

    public TripResponse updateTrip(Long id, TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new DriverNotFoundException("Driver not found with id: " + request.getDriverId()));

        if (request.getExpectedEndDate() != null && request.getStartDate() != null) {
            if (request.getExpectedEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("Expected end date cannot be earlier than start date");
            }
        }

        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setSource(request.getSource());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setExpectedEndDate(request.getExpectedEndDate());
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        Trip updated = tripRepository.save(trip);
        return TripResponse.fromEntity(updated);
    }

    public void deleteTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + id));
        tripRepository.delete(trip);
    }
}
