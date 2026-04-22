package com.BankProject.BankApplication.Controller;

import java.nio.file.AccessDeniedException;

import javax.naming.directory.InvalidAttributesException;
import javax.security.auth.login.AccountNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.BankProject.BankApplication.DTOs.TransactionResponseDTO;
import com.BankProject.BankApplication.DTOs.TransferSlip;
import com.BankProject.BankApplication.Service.TransactionService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
     @Autowired
     private TransactionService transactionService;

     // Displays transaction history
     @GetMapping("/history")
     public ResponseEntity<Page<TransactionResponseDTO>> getTransactions(
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size) {
          Page<TransactionResponseDTO> transactions = transactionService.checkTransactionHistory(page, size);
          return ResponseEntity.ok(transactions);
     }

     @PostMapping("/deposit")
     public ResponseEntity<?> deposit(@RequestBody double amount) {
          TransactionResponseDTO transactions = transactionService.deposit(amount);
          return ResponseEntity.status(HttpStatus.OK).body(transactions);
     }

     @PostMapping("/withdraw")
     public ResponseEntity<?> withdraw(@RequestBody Double amount) {
          TransactionResponseDTO transactions = transactionService.withdraw(amount);
          return ResponseEntity.status(HttpStatus.OK).body(transactions);
     }

     @PostMapping("/transfer")
     public ResponseEntity<?> transferAmount(@RequestBody TransferSlip transferSlip)
               throws AccountNotFoundException, AccessDeniedException, InvalidAttributesException {
          TransactionResponseDTO transactions = transactionService.transferAmount(transferSlip);
          return ResponseEntity.status(HttpStatus.OK).body(transactions);
     }

}
