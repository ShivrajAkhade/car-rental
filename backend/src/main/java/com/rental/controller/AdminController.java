package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.model.Booking;
import com.rental.model.Booking.BookingStatus;
import com.rental.model.User;
import com.rental.model.Vehicle;
import com.rental.service.AdminService;
import com.rental.service.BookingService;
import com.rental.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final VehicleService vehicleService;
    private final BookingService bookingService;

    public AdminController(AdminService adminService,
                           VehicleService vehicleService,
                           BookingService bookingService) {
        this.adminService = adminService;
        this.vehicleService = vehicleService;
        this.bookingService = bookingService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehiclesForAdmin());
    }

    @PostMapping("/vehicles")
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@Valid @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicle));
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody Vehicle vehicle) {
        ApiResponse<Vehicle> response = vehicleService.updateVehicle(id, vehicle);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<ApiResponse<?>> deleteVehicle(@PathVariable Long id) {
        ApiResponse<?> response = vehicleService.deleteVehicle(id);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        ApiResponse<?> response = bookingService.updateBookingStatus(id, status);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }
}
