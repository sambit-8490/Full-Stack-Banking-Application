package com.BankProject.BankApplication.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;

import javax.security.auth.login.AccountNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BankProject.BankApplication.DTOs.CustomUserInfo;
import com.BankProject.BankApplication.DTOs.UserAccountTemplate;
import com.BankProject.BankApplication.Entity.User;
import com.BankProject.BankApplication.Enum.Role;
import com.BankProject.BankApplication.Exceptions.UserAlreadyExistsException;
import com.BankProject.BankApplication.Exceptions.UserNotFoundException;
import com.BankProject.BankApplication.Repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private CacheManager cacheManager;

    // REGISTER USER — email verification removed
    @Transactional
    public CustomUserInfo registerUser(UserAccountTemplate userAccountTemplate)
            throws UserAlreadyExistsException {

        if (userRepository.findUserByEmailIgnoreCase(userAccountTemplate.getEmail()).isEmpty()) {

            User user = new User();
            user.setFullName(userAccountTemplate.getFullName());
            user.setEmail(userAccountTemplate.getEmail());
            user.setPassword(passwordEncoder.encode(userAccountTemplate.getPassword()));
            user.setRole(userAccountTemplate.getRole());

            // USER ACTIVE IMMEDIATELY
            user.setIsEnabled(true);

            User savedUser = userRepository.save(user);

            // create bank account
            savedUser.setAccount(accountService.createAccount(userAccountTemplate, savedUser));
            savedUser = userRepository.save(savedUser);

            return createCustomUserInfo(savedUser);
        }

        throw new UserAlreadyExistsException(
                "User with email " + userAccountTemplate.getEmail() + " already exists");
    }

    public CustomUserInfo updateUser(String id, User updatedUser) throws AccessDeniedException {

        Cache userCache = cacheManager.getCache("user");

        if (userCache != null) {
            User existingCacheUser = userCache.get(id, User.class);
            if (existingCacheUser != null) {
                existingCacheUser = updateExistingUser(existingCacheUser, updatedUser, id);
                userRepository.save(existingCacheUser);
                userCache.put(id, existingCacheUser);
                return createCustomUserInfo(existingCacheUser);
            }
        }

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        User savedUser = userRepository.save(updateExistingUser(existingUser, updatedUser, id));

        if (userCache != null) {
            userCache.put(id, savedUser);
        }

        return createCustomUserInfo(savedUser);
    }

    protected User updateExistingUser(User existingUser, User updatedUser, String id)
            throws AccessDeniedException {

        if (validateUser(id)) {

            if (updatedUser.getFullName() != null && !updatedUser.getFullName().isEmpty()) {
                existingUser.setFullName(updatedUser.getFullName());
            }

            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                existingUser.setEmail(updatedUser.getEmail());
            }

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }

            return existingUser;
        }

        throw new AccessDeniedException("You can only edit your own account");
    }

    public Boolean deleteUser(String id) throws AccessDeniedException {

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin || validateUser(id)) {
            userRepository.deleteById(id);

            Cache userCache = cacheManager.getCache("user");
            if (userCache != null) {
                userCache.evict(id);
            }

            return true;
        }

        throw new AccessDeniedException("You can only delete your account");
    }

    public double accountBalance() throws AccountNotFoundException {

        User user = userRepository.findUserByEmailIgnoreCase(findCurrentUserEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return accountService.checkBalance(user.getAccount().getAccountNumber());
    }

    private Boolean validateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return user.getEmail().equals(findCurrentUserEmail());
    }

    private CustomUserInfo createCustomUserInfo(User user) {

        CustomUserInfo info = new CustomUserInfo();
        info.setUserId(user.getUserId());
        info.setFullName(user.getFullName());
        info.setEmail(user.getEmail());
        info.setRole(user.getRole());

        if (user.getAccount() != null) {
            info.setAccountNumber(user.getAccount().getAccountNumber());
            info.setBalance(user.getAccount().getBalance());
            info.setAccountType(user.getAccount().getAccountType());
        }

        return info;
    }

    @Transactional(readOnly = true)
    public CustomUserInfo getCurrentUserInfo() {
        User user = userRepository.findUserByEmailIgnoreCase(findCurrentUserEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return createCustomUserInfo(user);
    }

    public User findUserByEmail(String email) {
        return userRepository.findUserByEmailIgnoreCase(email).orElse(null);
    }

    public void changePassword(String currentPassword, String newPassword) {

        User user = userRepository.findUserByEmailIgnoreCase(findCurrentUserEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<CustomUserInfo> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);

        List<CustomUserInfo> filteredUsers = userPage.stream()
                .filter(u -> u.getRole() == Role.USER && u.getAccount() != null)
                .map(u -> new CustomUserInfo(
                        u.getUserId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getRole(),
                        u.getAccount().getAccountNumber(),
                        u.getAccount().getBalance(),
                        u.getAccount().getAccountType()))
                .toList();

        return new PageImpl<>(filteredUsers, pageable, filteredUsers.size());
    }

    // EMAIL VERIFICATION DISABLED COMPLETELY
    public ResponseEntity<?> verifyToken(String token) {
        return ResponseEntity.badRequest().body("Email verification disabled.");
    }

    public String findCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
