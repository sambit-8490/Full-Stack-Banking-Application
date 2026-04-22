package com.BankProject.BankApplication.Controller;

import java.nio.file.AccessDeniedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.BankProject.BankApplication.DTOs.CustomUserInfo;
import com.BankProject.BankApplication.DTOs.UserAccountTemplate;
import com.BankProject.BankApplication.Service.UserService;

@RestController
@RequestMapping("/api/admin")
// This controller is responsible for handling admin functionalities
public class AdminController {
     // This class will handle admin specific functionalities
     // such as managing users, viewing reports, etc.
     @Autowired
     private UserService userService;

     // Add methods for admin functionalities here
     // For example:
     @GetMapping("/users")
     public ResponseEntity<Page<CustomUserInfo>> getAllUsers(@RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size) {
          // Logic to get all users
          return ResponseEntity.status(HttpStatus.OK).body(userService.getAllUsers(page, size));
     }

     @PostMapping("/users")
     public ResponseEntity<CustomUserInfo> createUser(@RequestBody UserAccountTemplate userAccountTemplate) {
          return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userService.registerUser(userAccountTemplate));
     }

     @DeleteMapping("/users/{id}")
     public ResponseEntity<?> deleteUser(@PathVariable String id) throws AccessDeniedException {
          // Logic to delete a user by id
          userService.deleteUser(id);
          return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
     }
}
