package com.BankProject.BankApplication;

import com.BankProject.BankApplication.DTOs.UserAccountTemplate;
import com.BankProject.BankApplication.Enum.AccountType;
import com.BankProject.BankApplication.Enum.Role;
import com.BankProject.BankApplication.Repository.UserRepository;
import com.BankProject.BankApplication.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@securebank.com";

        // Only create if admin doesn't already exist
        if (userRepository.findUserByEmailIgnoreCase(adminEmail).isEmpty()) {
            UserAccountTemplate admin = new UserAccountTemplate();
            admin.setFullName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword("Admin@1234");
            admin.setBalance(0.0);
            admin.setAccountType(AccountType.SAVINGS);
            admin.setRole(Role.ADMIN);

            userService.registerUser(admin);
            System.out.println("✅ Default admin created: " + adminEmail + " / Admin@1234");
        } else {
            System.out.println("ℹ️ Admin already exists, skipping creation.");
        }
    }
}
