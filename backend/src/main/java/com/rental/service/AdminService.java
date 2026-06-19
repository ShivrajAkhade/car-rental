package com.rental.service;

import com.rental.model.Booking;
import com.rental.model.Booking.BookingStatus;
import com.rental.model.User;
import com.rental.repository.BookingRepository;
import com.rental.repository.UserRepository;
import com.rental.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public AdminService(UserRepository userRepository,
                        VehicleRepository vehicleRepository,
                        BookingRepository bookingRepository,
                        BookingService bookingService) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalVehicles", vehicleRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingBookings", bookingService.getBookingCountByStatus(BookingStatus.PENDING));
        stats.put("confirmedBookings", bookingService.getBookingCountByStatus(BookingStatus.CONFIRMED));
        stats.put("cancelledBookings", bookingService.getBookingCountByStatus(BookingStatus.CANCELLED));
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
}
