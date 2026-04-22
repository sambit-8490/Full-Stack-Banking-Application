package com.BankProject.BankApplication.Entity;

import java.io.Serializable;
import com.BankProject.BankApplication.Enum.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String userId;

    @NotNull(message = "Please Enter Your Full name")
    private String fullName;

    @Email(message = "Please Enter a Valid Email")
    @Column(unique = true, nullable = false)
    private String email;

    @NotNull(message = "Please Provide a Password")
    private String password;

    // Explicit mapping to TINYINT(1) to handle MySQL boolean properly
    @Column(nullable = false, columnDefinition = "TINYINT(1)")
    private Boolean isEnabled;

    @Enumerated(EnumType.STRING)
    private Role role;

    // One-to-one relationship with Account
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", referencedColumnName = "accountNumber", unique = true)
    private Account account;
}
