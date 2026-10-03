package com.trackflow.repository;

import com.trackflow.entity.Delivery;
import com.trackflow.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByTrackingNumber(String trackingNumber);
    boolean existsByTrackingNumber(String trackingNumber);
    List<Delivery> findByStatus(DeliveryStatus status);
    List<Delivery> findByTripId(Long tripId);
}
