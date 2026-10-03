package com.trackflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trackflow.dto.DeliveryRequest;
import com.trackflow.dto.DriverRequest;
import com.trackflow.dto.TripRequest;
import com.trackflow.dto.VehicleRequest;
import com.trackflow.entity.*;
import com.trackflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TrackflowApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        deliveryRepository.deleteAll();
        tripRepository.deleteAll();
        vehicleRepository.deleteAll();
        driverRepository.deleteAll();
        userRepository.deleteAll();

        // Setup users
        userRepository.save(new User("admin", passwordEncoder.encode("admin123"), UserRole.ADMIN));
        userRepository.save(new User("manager", passwordEncoder.encode("manager123"), UserRole.MANAGER));
        userRepository.save(new User("operator", passwordEncoder.encode("operator123"), UserRole.OPERATOR));
    }

    @Test
    void contextLoads() {
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateVehicle_Success() throws Exception {
        VehicleRequest request = new VehicleRequest("KA01-ZZ-9999", "TRUCK", "Volvo FH16", 40000.0, VehicleStatus.AVAILABLE);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.vehicleNumber").value("KA01-ZZ-9999"))
                .andExpect(jsonPath("$.capacity").value(40000.0));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testRetrieveVehicle_Success() throws Exception {
        Vehicle vehicle = vehicleRepository.save(new Vehicle("RJ14-XY-1234", "VAN", "Tata Ace", 1000.0, VehicleStatus.AVAILABLE));

        mockMvc.perform(get("/api/vehicles/" + vehicle.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleNumber").value("RJ14-XY-1234"))
                .andExpect(jsonPath("$.model").value("Tata Ace"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testVehicleNotFound() throws Exception {
        mockMvc.perform(get("/api/vehicles/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message", containsString("Vehicle not found")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateVehicle_InvalidInput() throws Exception {
        VehicleRequest invalidRequest = new VehicleRequest("", "TRUCK", "", -100.0, null);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateDriver_Success() throws Exception {
        DriverRequest request = new DriverRequest("Vikram Rathore", "+91-9988776655", "DL-1420200098765", DriverStatus.AVAILABLE);

        mockMvc.perform(post("/api/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Vikram Rathore"))
                .andExpect(jsonPath("$.licenseNumber").value("DL-1420200098765"));
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void testCreateTripWithValidVehicleAndDriver() throws Exception {
        Vehicle vehicle = vehicleRepository.save(new Vehicle("HR26-AB-0001", "TRUCK", "BharatBenz 2823", 28000.0, VehicleStatus.AVAILABLE));
        Driver driver = driverRepository.save(new Driver("Sunil Kumar", "+91-9123456789", "HR-2620190011223", DriverStatus.AVAILABLE));

        TripRequest request = new TripRequest(
                vehicle.getId(),
                driver.getId(),
                "Gurugram",
                "Chandigarh",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2),
                TripStatus.PLANNED
        );

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.source").value("Gurugram"))
                .andExpect(jsonPath("$.destination").value("Chandigarh"))
                .andExpect(jsonPath("$.vehicleNumber").value("HR26-AB-0001"))
                .andExpect(jsonPath("$.driverName").value("Sunil Kumar"));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void testCreateDelivery_Success() throws Exception {
        Vehicle vehicle = vehicleRepository.save(new Vehicle("UP32-TR-5555", "TRUCK", "Tata Signa", 35000.0, VehicleStatus.AVAILABLE));
        Driver driver = driverRepository.save(new Driver("Manoj Yadav", "+91-9811223344", "UP-3220170044556", DriverStatus.AVAILABLE));
        Trip trip = tripRepository.save(new Trip(vehicle, driver, "Lucknow", "Kanpur", LocalDateTime.now(), LocalDateTime.now().plusDays(1), TripStatus.IN_PROGRESS));

        DeliveryRequest deliveryRequest = new DeliveryRequest(
                "TRK-99999",
                trip.getId(),
                "Kavita Devi",
                "77 Mall Road, Kanpur",
                LocalDateTime.now().plusDays(1),
                DeliveryStatus.PENDING
        );

        mockMvc.perform(post("/api/deliveries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deliveryRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.trackingNumber").value("TRK-99999"))
                .andExpect(jsonPath("$.customerName").value("Kavita Devi"));
    }

    @Test
    void testSecurity_UnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void testSecurity_OperatorCannotCreateVehicle_Returns403() throws Exception {
        VehicleRequest request = new VehicleRequest("DL04-CC-1111", "CAR", "Maruti Ertiga", 800.0, VehicleStatus.AVAILABLE);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }
}
