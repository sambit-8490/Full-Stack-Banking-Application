package com.BankProject.BankApplication.Controller;

import org.springframework.web.bind.annotation.RestController;
import com.BankProject.BankApplication.DTOs.AuthRequest;
import com.BankProject.BankApplication.Entity.User;
import com.BankProject.BankApplication.Repository.UserRepository;
import com.BankProject.BankApplication.Utils.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api")
public class AuthController {

     @Autowired
     private AuthenticationManager authenticationManager;

     @Autowired
     private JwtUtils jwtUtils;

     @Autowired
     private UserRepository userRepository;

     @PostMapping("/authenticate")
     public ResponseEntity<?> generateJwtToken(@RequestBody AuthRequest authRequest) throws Exception {

          User user = userRepository.findUserByEmailIgnoreCase(authRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

          authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                              authRequest.getUsername(),
                              authRequest.getPassword()
                    )
          );

          return ResponseEntity.ok().body(jwtUtils.generateToken(authRequest.getUsername()));
     }
}
