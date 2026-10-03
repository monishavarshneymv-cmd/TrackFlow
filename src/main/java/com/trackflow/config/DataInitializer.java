package com.trackflow.config;

import com.trackflow.entity.*;
import com.trackflow.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final DeliveryRepository deliveryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           DriverRepository driverRepository,
                           TripRepository tripRepository,
                           DeliveryRepository deliveryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.deliveryRepository = deliveryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedFleetAndDeliveries();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", passwordEncoder.encode("admin123"), UserRole.ADMIN));
            userRepository.save(new User("manager", passwordEncoder.encode("manager123"), UserRole.MANAGER));
            userRepository.save(new User("operator", passwordEncoder.encode("operator123"), UserRole.OPERATOR));
        }
    }

    private void seedFleetAndDeliveries() {
        if (vehicleRepository.count() == 0 && driverRepository.count() == 0) {
            // Seed Vehicles
            Vehicle v1 = vehicleRepository.save(new Vehicle(
                    "UP16-AB-1234", "TRUCK", "Tata Prima 4028.S", 28000.0, VehicleStatus.IN_USE));
            Vehicle v2 = vehicleRepository.save(new Vehicle(
                    "MH02-CD-5678", "VAN", "Force Traveller 3050", 3500.0, VehicleStatus.IN_USE));
            Vehicle v3 = vehicleRepository.save(new Vehicle(
                    "DL01-EF-9012", "TRUCK", "Ashok Leyland Ecomet 1215", 12000.0, VehicleStatus.AVAILABLE));

            // Seed Drivers
            Driver d1 = driverRepository.save(new Driver(
                    "Rahul Sharma", "+91-9876543210", "DL-0420110012345", DriverStatus.ON_TRIP));
            Driver d2 = driverRepository.save(new Driver(
                    "Priya Singh", "+91-9876543211", "MH-0220150067890", DriverStatus.ON_TRIP));
            Driver d3 = driverRepository.save(new Driver(
                    "Amit Kumar", "+91-9876543212", "UP-1620180054321", DriverStatus.AVAILABLE));

            // Seed Trips
            Trip trip1 = tripRepository.save(new Trip(
                    v1, d1, "New Delhi", "Jaipur",
                    LocalDateTime.now().minusDays(1),
                    LocalDateTime.now().plusDays(1),
                    TripStatus.IN_PROGRESS));

            Trip trip2 = tripRepository.save(new Trip(
                    v2, d2, "Mumbai", "Pune",
                    LocalDateTime.now().minusHours(4),
                    LocalDateTime.now().plusHours(4),
                    TripStatus.IN_PROGRESS));

            Trip trip3 = tripRepository.save(new Trip(
                    v3, d3, "Noida", "Agra",
                    LocalDateTime.now().plusDays(1),
                    LocalDateTime.now().plusDays(2),
                    TripStatus.PLANNED));

            // Seed Deliveries
            deliveryRepository.save(new Delivery(
                    "TRK-1001", trip1, "Rahul Verma", "123 MG Road, Jaipur, Rajasthan",
                    LocalDateTime.now().plusDays(1), DeliveryStatus.PENDING));

            deliveryRepository.save(new Delivery(
                    "TRK-1002", trip1, "Anita Sharma", "45 MI Road, Jaipur, Rajasthan",
                    LocalDateTime.now().plusDays(1), DeliveryStatus.ASSIGNED));

            deliveryRepository.save(new Delivery(
                    "TRK-2001", trip2, "Suresh Patel", "88 FC Road, Pune, Maharashtra",
                    LocalDateTime.now().plusHours(3), DeliveryStatus.OUT_FOR_DELIVERY));

            deliveryRepository.save(new Delivery(
                    "TRK-3001", trip3, "Neha Gupta", "12 Fatehabad Road, Agra, UP",
                    LocalDateTime.now().plusDays(2), DeliveryStatus.PENDING));
        }
    }
}
