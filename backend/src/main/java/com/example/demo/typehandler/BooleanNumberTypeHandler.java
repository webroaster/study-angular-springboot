package com.example.demo.typehandler;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * JavaのBooleanとJDBCのNUMBER(1)をマッピングするTypeHandler.
 * trueを1に、falseを0に変換します。
 */
@MappedTypes(Boolean.class)
public class BooleanNumberTypeHandler extends BaseTypeHandler<Boolean> {

    // Java(Boolean)からDB(NUMBER)への変換
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Boolean parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, (parameter ? 1 : 0));
    }

    // DB(NUMBER)からJava(Boolean)への変換 (カラム名で取得)
    @Override
    public Boolean getNullableResult(ResultSet rs, String columnName) throws SQLException {
        // 0以外はすべてtrueとして扱うこともできますが、厳密に1をtrueとします。
        return rs.getInt(columnName) == 1;
    }

    // DB(NUMBER)からJava(Boolean)への変換 (カラムインデックスで取得)
    @Override
    public Boolean getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return rs.getInt(columnIndex) == 1;
    }

    // DB(NUMBER)からJava(Boolean)への変換 (ストアドプロシージャ用)
    @Override
    public Boolean getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return cs.getInt(columnIndex) == 1;
    }
}
