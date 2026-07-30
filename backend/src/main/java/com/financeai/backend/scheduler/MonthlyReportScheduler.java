package com.financeai.backend.scheduler;

import com.financeai.backend.entity.User;
import com.financeai.backend.repository.UserRepository;
import com.financeai.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class MonthlyReportScheduler {

    private final UserRepository userRepository;
    private final ReportService reportService;

    // Jalan otomatis tiap tanggal 1, jam 07:00 pagi, untuk laporan bulan sebelumnya
    @Scheduled(cron = "0 0 7 1 * *")
    public void sendMonthlyReports() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        int month = lastMonth.getMonthValue();
        int year = lastMonth.getYear();

        for (User user : userRepository.findAll()) {
            try {
                reportService.sendReportEmail(user.getEmail(), month, year);
            } catch (Exception e) {
                System.err.println("Gagal kirim laporan ke " + user.getEmail() + ": " + e.getMessage());
            }
        }
    }
}