package com.eduspace.roomservice.config;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Flyway {@code baseline-on-migrate} chỉ áp dụng khi <strong>chưa có</strong> bảng metadata.
 * Nếu {@code flyway_schema_history} đã tạo nhưng <strong>trống</strong> (sau khi xóa dòng / lỗi migrate),
 * Flyway vẫn chạy lại từ V1 → trùng bảng. Ở dev, gọi {@link Flyway#baseline()} trước {@link Flyway#migrate()}
 * khi schema đã có bảng nghiệp vụ (vd. {@code room_categories}) nhưng lịch sử Flyway trống.
 */
@Configuration
@Profile("dev")
public class FlywaySchemaRepairMigrationStrategy {

    private static final Logger log = LoggerFactory.getLogger(FlywaySchemaRepairMigrationStrategy.class);

    @Bean
    FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            DataSource ds = flyway.getConfiguration().getDataSource();
            try (Connection c = ds.getConnection()) {
                boolean historyTable = tableExists(c, "flyway_schema_history");
                boolean hasAppTables = tableExists(c, "room_categories");

                if (!historyTable && !hasAppTables) {
                    flyway.migrate();
                    return;
                }
                if (!historyTable && hasAppTables) {
                    log.warn(
                            "[dev] Schema đã có bảng (vd. room_categories) nhưng chưa có flyway_schema_history — gọi baseline() rồi migrate().");
                    flyway.baseline();
                    flyway.migrate();
                    return;
                }

                long historyRows = countRows(c, "flyway_schema_history");
                if (historyRows == 0 && hasAppTables) {
                    log.warn(
                            "[dev] flyway_schema_history trống nhưng schema đã có bảng — gọi baseline() rồi migrate().");
                    flyway.baseline();
                }
            } catch (SQLException e) {
                String msg =
                        ("Flyway dev repair: không kết nối được PostgreSQL: %s. "
                                        + "Bật room-db (docker compose up -d room-db), đợi container ready. "
                                        + "Trên Windows nếu dùng localhost bị refused, thử 127.0.0.1 trong SPRING_DATASOURCE_URL. "
                                        + "Kiểm tra POSTGRES_ROOM_HOST_PORT trong .env khớp cổng publish.")
                                .formatted(e.getMessage());
                throw new IllegalStateException(msg, e);
            }
            flyway.migrate();
        };
    }

    private static boolean tableExists(Connection c, String table) throws SQLException {
        String sql =
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = ?)";
        try (var ps = c.prepareStatement(sql)) {
            ps.setString(1, table);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getBoolean(1);
            }
        }
    }

    private static long countRows(Connection c, String table) throws SQLException {
        String q = "\"" + table.replace("\"", "\"\"") + "\"";
        try (Statement st = c.createStatement();
                ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM " + q)) {
            return rs.next() ? rs.getLong(1) : 0L;
        }
    }
}
