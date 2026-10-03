package com.trackflow.service;

import com.trackflow.dto.DeliveryRequest;
import com.trackflow.dto.DeliveryResponse;
import com.trackflow.entity.Delivery;
import com.trackflow.entity.DeliveryStatus;
import com.trackflow.entity.Trip;
import com.trackflow.exception.DeliveryNotFoundException;
import com.trackflow.exception.DuplicateResourceException;
import com.trackflow.exception.TripNotFoundException;
import com.trackflow.repository.DeliveryRepository;
import com.trackflow.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final TripRepository tripRepository;

    public DeliveryService(DeliveryRepository deliveryRepository, TripRepository tripRepository) {
        this.deliveryRepository = deliveryRepository;
        this.tripRepository = tripRepository;
    }

    public DeliveryResponse createDelivery(DeliveryRequest request) {
        if (deliveryRepository.existsByTrackingNumber(request.getTrackingNumber())) {
            throw new DuplicateResourceException("Delivery with tracking number '" + request.getTrackingNumber() + "' already exists");
        }

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + request.getTripId()));

        Delivery delivery = new Delivery(
                request.getTrackingNumber(),
                trip,
                request.getCustomerName(),
                request.getDeliveryAddress(),
                request.getScheduledDate(),
                request.getStatus() != null ? request.getStatus() : DeliveryStatus.PENDING
        );

        Delivery saved = deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAllDeliveries(DeliveryStatus status) {
        List<Delivery> list;
        if (status != null) {
            list = deliveryRepository.findByStatus(status);
        } else {
            list = deliveryRepository.findAll();
        }

        return list.stream()
                .map(DeliveryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found with id: " + id));
        return DeliveryResponse.fromEntity(delivery);
    }

    public DeliveryResponse updateDelivery(Long id, DeliveryRequest request) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found with id: " + id));

        if (!delivery.getTrackingNumber().equals(request.getTrackingNumber())
                && deliveryRepository.existsByTrackingNumber(request.getTrackingNumber())) {
            throw new DuplicateResourceException("Delivery with tracking number '" + request.getTrackingNumber() + "' already exists");
        }

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + request.getTripId()));

        delivery.setTrackingNumber(request.getTrackingNumber());
        delivery.setTrip(trip);
        delivery.setCustomerName(request.getCustomerName());
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setScheduledDate(request.getScheduledDate());
        if (request.getStatus() != null) {
            delivery.setStatus(request.getStatus());
        }

        Delivery updated = deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(updated);
    }

    public void deleteDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found with id: " + id));
        deliveryRepository.delete(delivery);
    }
}
