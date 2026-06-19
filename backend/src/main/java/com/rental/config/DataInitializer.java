package com.rental.config;

import com.rental.model.User;
import com.rental.model.Vehicle;
import com.rental.repository.UserRepository;
import com.rental.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User("Admin", "admin@gmail.com",
                    passwordEncoder.encode("admin123"), "9876543210");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);

            User user = new User("John Doe", "john@example.com",
                    passwordEncoder.encode("password123"), "9876543211");
            userRepository.save(user);
        }

        if (vehicleRepository.count() == 0) {
            seedVehicle("Toyota Fortuner", "Toyota", "SUV", 2024,
                    new BigDecimal("4500"), true, 7, "Automatic",
                    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=250&fit=crop",
                    "Powerful SUV with excellent off-road capability and premium interiors.");
            seedVehicle("Honda City", "Honda", "Sedan", 2024,
                    new BigDecimal("2500"), true, 5, "Manual",
                    "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=250&fit=crop",
                    "Compact sedan with great fuel efficiency and modern features.");
            seedVehicle("Hyundai Creta", "Hyundai", "SUV", 2023,
                    new BigDecimal("3500"), true, 5, "Automatic",
                    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=250&fit=crop",
                    "Stylish SUV with comfortable ride and advanced safety features.");
            seedVehicle("Maruti Swift", "Maruti", "Hatchback", 2024,
                    new BigDecimal("1500"), true, 5, "Manual",
                    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop",
                    "Fun-to-drive hatchback perfect for city commutes.");
            seedVehicle("Mercedes-Benz E-Class", "Mercedes", "Luxury", 2024,
                    new BigDecimal("12000"), true, 5, "Automatic",
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop",
                    "Luxury sedan offering unmatched comfort and cutting-edge technology.");
            seedVehicle("Toyota Innova Crysta", "Toyota", "MUV", 2023,
                    new BigDecimal("4000"), true, 8, "Manual",
                    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
                    "Spacious MUV ideal for family trips with ample luggage space.");
            seedVehicle("Mahindra Thar", "Mahindra", "SUV", 2024,
                    new BigDecimal("5000"), true, 4, "Manual",
                    "https://images.unsplash.com/photo-1566021359809-24a2204c87b6?w=400&h=250&fit=crop",
                    "Iconic off-road SUV with rugged design and powerful engine.");
            seedVehicle("BMW 5 Series", "BMW", "Luxury", 2024,
                    new BigDecimal("15000"), true, 5, "Automatic",
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
                    "Premium German sedan delivering exhilarating performance and luxury.");
        }
    }

    private void seedVehicle(String name, String brand, String type, int year,
                              BigDecimal price, boolean available, int seats,
                              String transmission, String imageUrl, String description) {
        Vehicle v = new Vehicle();
        v.setName(name);
        v.setBrand(brand);
        v.setType(type);
        v.setYear(year);
        v.setPricePerDay(price);
        v.setAvailable(available);
        v.setSeatingCapacity(seats);
        v.setTransmission(transmission);
        v.setImageUrl(imageUrl);
        v.setDescription(description);
        vehicleRepository.save(v);
    }
}
