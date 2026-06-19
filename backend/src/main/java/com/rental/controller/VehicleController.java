package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.model.Vehicle;
import com.rental.service.VehicleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAllVehicles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal maxPrice) {

        if (search != null || type != null || maxPrice != null) {
            return ResponseEntity.ok(vehicleService.searchVehicles(search, type, maxPrice));
        }
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicle(@PathVariable Long id) {
        ApiResponse<Vehicle> response = vehicleService.getVehicleById(id);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
