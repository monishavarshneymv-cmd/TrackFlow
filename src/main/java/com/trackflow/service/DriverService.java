package com.trackflow.service;

import com.trackflow.dto.DriverRequest;
import com.trackflow.dto.DriverResponse;
import com.trackflow.entity.Driver;
import com.trackflow.entity.DriverStatus;
import com.trackflow.exception.DriverNotFoundException;
import com.trackflow.exception.DuplicateResourceException;
import com.trackflow.repository.DriverRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public DriverResponse createDriver(DriverRequest request) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver with license number '" + request.getLicenseNumber() + "' already exists");
        }

        Driver driver = new Driver(
                request.getName(),
                request.getPhone(),
                request.getLicenseNumber(),
                request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE
        );

        Driver saved = driverRepository.save(driver);
        return DriverResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers(String search) {
        List<Driver> list;
        if (search != null && !search.trim().isEmpty()) {
            list = driverRepository.searchDrivers(search.trim());
        } else {
            list = driverRepository.findAll();
        }

        return list.stream()
                .map(DriverResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found with id: " + id));
        return DriverResponse.fromEntity(driver);
    }

    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found with id: " + id));

        if (!driver.getLicenseNumber().equals(request.getLicenseNumber())
                && driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver with license number '" + request.getLicenseNumber() + "' already exists");
        }

        driver.setName(request.getName());
        driver.setPhone(request.getPhone());
        driver.setLicenseNumber(request.getLicenseNumber());
        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }

        Driver updated = driverRepository.save(driver);
        return DriverResponse.fromEntity(updated);
    }

    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found with id: " + id));
        driverRepository.delete(driver);
    }
}
