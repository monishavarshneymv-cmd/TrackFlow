package com.trackflow.service;

import com.trackflow.dto.VehicleRequest;
import com.trackflow.dto.VehicleResponse;
import com.trackflow.entity.Vehicle;
import com.trackflow.entity.VehicleStatus;
import com.trackflow.exception.DuplicateResourceException;
import com.trackflow.exception.VehicleNotFoundException;
import com.trackflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new DuplicateResourceException("Vehicle with number '" + request.getVehicleNumber() + "' already exists");
        }

        Vehicle vehicle = new Vehicle(
                request.getVehicleNumber(),
                request.getVehicleType(),
                request.getModel(),
                request.getCapacity(),
                request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE
        );

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles(VehicleStatus status, String vehicleType, String search) {
        List<Vehicle> list;

        if (search != null && !search.trim().isEmpty()) {
            list = vehicleRepository.searchVehicles(search.trim());
        } else if (status != null) {
            list = vehicleRepository.findByStatus(status);
        } else if (vehicleType != null && !vehicleType.trim().isEmpty()) {
            list = vehicleRepository.findByVehicleTypeIgnoreCase(vehicleType.trim());
        } else {
            list = vehicleRepository.findAll();
        }

        return list.stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));
        return VehicleResponse.fromEntity(vehicle);
    }

    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));

        if (!vehicle.getVehicleNumber().equals(request.getVehicleNumber())
                && vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new DuplicateResourceException("Vehicle with number '" + request.getVehicleNumber() + "' already exists");
        }

        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setModel(request.getModel());
        vehicle.setCapacity(request.getCapacity());
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(updated);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(vehicle);
    }
}
