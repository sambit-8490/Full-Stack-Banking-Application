package com.BankProject.BankApplication.Controller;

import java.nio.file.AccessDeniedException;
import java.util.Map;

import javax.security.auth.login.AccountNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.BankProject.BankApplication.Entity.User;
import com.BankProject.BankApplication.Service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> userDashboard() {
        return ResponseEntity.ok().body(userService.getCurrentUserInfo());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) throws AccessDeniedException {
        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) throws AccessDeniedException {
        userService.deleteUser(id);
        return ResponseEntity.ok("User Deleted!");
    }

    @GetMapping("/balance")
    public ResponseEntity<?> checkBalance() throws AccountNotFoundException {
        return ResponseEntity.ok().body(userService.accountBalance());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Current password is required");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("New password is required");
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("New password must be at least 6 characters");
        }

        userService.changePassword(currentPassword, newPassword);
        return ResponseEntity.ok("Password changed successfully!");
    }
}
