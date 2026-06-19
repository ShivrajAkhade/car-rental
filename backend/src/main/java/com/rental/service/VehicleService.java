package com.rental.service;

import com.rental.dto.ApiResponse;
import com.rental.model.Vehicle;
import com.rental.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public ApiResponse<List<Vehicle>> getAllVehicles() {
        return ApiResponse.success("Vehicles retrieved", vehicleRepository.findByAvailableTrue());
    }

    public ApiResponse<List<Vehicle>> searchVehicles(String search, String type, BigDecimal maxPrice) {
        List<Vehicle> vehicles = vehicleRepository.searchVehicles(
                search, type, maxPrice, true);
        return ApiResponse.success("Vehicles retrieved", vehicles);
    }

    public ApiResponse<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .map(vehicle -> ApiResponse.success("Vehicle retrieved", vehicle))
                .orElse(ApiResponse.error("Vehicle not found"));
    }

    public ApiResponse<Vehicle> createVehicle(Vehicle vehicle) {
        Vehicle saved = vehicleRepository.save(vehicle);
        return ApiResponse.success("Vehicle created", saved);
    }

    public ApiResponse<Vehicle> updateVehicle(Long id, Vehicle vehicleDetails) {
        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    vehicle.setName(vehicleDetails.getName());
                    vehicle.setBrand(vehicleDetails.getBrand());
                    vehicle.setType(vehicleDetails.getType());
                    vehicle.setYear(vehicleDetails.getYear());
                    vehicle.setPricePerDay(vehicleDetails.getPricePerDay());
                    vehicle.setImageUrl(vehicleDetails.getImageUrl());
                    vehicle.setAvailable(vehicleDetails.isAvailable());
                    vehicle.setDescription(vehicleDetails.getDescription());
                    vehicle.setSeatingCapacity(vehicleDetails.getSeatingCapacity());
                    vehicle.setTransmission(vehicleDetails.getTransmission());
                    Vehicle saved = vehicleRepository.save(vehicle);
                    return ApiResponse.success("Vehicle updated", saved);
                })
                .orElse(ApiResponse.error("Vehicle not found"));
    }

    public ApiResponse<?> deleteVehicle(Long id) {
        if (vehicleRepository.existsById(id)) {
            vehicleRepository.deleteById(id);
            return ApiResponse.success("Vehicle deleted");
        }
        return ApiResponse.error("Vehicle not found");
    }

    public List<Vehicle> getAllVehiclesForAdmin() {
        return vehicleRepository.findAll();
    }
}
