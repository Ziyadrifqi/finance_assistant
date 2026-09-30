package com.financeai.backend.service;

import com.financeai.backend.dto.PaymentSourceRequest;
import com.financeai.backend.dto.PaymentSourceResponse;
import com.financeai.backend.entity.PaymentSource;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.PaymentSourceRepository;
import com.financeai.backend.repository.SavingsDepositRepository;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentSourceService {

    private final PaymentSourceRepository paymentSourceRepository;
    private final TransactionRepository transactionRepository;
    private final SavingsDepositRepository savingsDepositRepository;
    private final UserRepository userRepository;

    public List<PaymentSourceResponse> getAll(String email) {
        User user = findUser(email);
        return paymentSourceRepository.findByUserOrderByNameAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PaymentSourceResponse create(String email, PaymentSourceRequest request) {
        User user = findUser(email);
        String name = request.getName().trim();

        if (paymentSourceRepository.existsByUserAndNameIgnoreCase(user, name)) {
            throw new IllegalArgumentException("Sumber dana dengan nama ini sudah ada");
        }

        PaymentSource source = PaymentSource.builder()
                .name(name)
                .type(request.getType())
                .color(request.getColor())
                .user(user)
                .build();
        paymentSourceRepository.save(source);
        return toResponse(source);
    }

    public PaymentSourceResponse update(String email, Long id, PaymentSourceRequest request) {
        User user = findUser(email);
        PaymentSource source = findSource(id, user);
        String name = request.getName().trim();

        if (paymentSourceRepository.existsByUserAndNameIgnoreCaseAndIdNot(user, name, id)) {
            throw new IllegalArgumentException("Sumber dana dengan nama ini sudah ada");
        }

        source.setName(name);
        source.setType(request.getType());
        source.setColor(request.getColor());
        paymentSourceRepository.save(source);
        return toResponse(source);
    }

    /**
     * Menghapus sumber dana. Transaksi & setoran yang memakainya tidak ikut terhapus,
     * hanya sumber dananya dikosongkan (tampil sebagai "Tanpa sumber").
     */
    @Transactional
    public void delete(String email, Long id) {
        User user = findUser(email);
        PaymentSource source = findSource(id, user);

        transactionRepository.clearPaymentSource(source);
        savingsDepositRepository.clearPaymentSource(source);
        paymentSourceRepository.delete(source);
    }

    private PaymentSource findSource(Long id, User user) {
        return paymentSourceRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Sumber dana tidak ditemukan"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }

    private PaymentSourceResponse toResponse(PaymentSource source) {
        return PaymentSourceResponse.builder()
                .id(source.getId())
                .name(source.getName())
                .type(source.getType())
                .color(source.getColor())
                .build();
    }
}