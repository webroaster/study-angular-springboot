# Repository パターン

## 1. Repository パターンとは？ (設計思想)

まず、Repository パターンは、特定の技術に依存しない設計パターンです。その目的は、ビジネスロジック（Service 層）とデータアクセスロジック（DB とのやり取り）を分離することです。

- Service 層は、「こういう条件でデータを取ってきてほしい」「このデータを保存してほしい」と Repository に依頼します。
- Service 層は、その裏でデータベースが Oracle なのか MySQL なのか、また ORM が JPA なのか MyBatis なのかを知りません。
- このおかげで、将来データベースや ORM 技術を変更したとしても、Service 層のコードへの影響を最小限に抑えることができます。

つまり、どのような技術スタックであっても、この「データアクセスを抽象化する」という Repository パターンの考え方自体は非常に有効です。

---

## 2. Spring Data JPA と JpaRepository

Spring Boot アプリケーションで `spring-boot-starter-data-jpa` を使う場合、この Repository パターンを極めて簡単に実現できる仕組みが Spring Data JPA です。

- `JpaRepository`: Spring Data JPA が提供するインターフェースです。
- JPA (Java Persistence API): Java で ORM（Object-Relational Mapping）を実現するための標準仕様です。
- Hibernate: JPA 仕様の最も有名な実装の一つです。

JpaRepository を継承するだけで CRUD メソッドが自動生成されるのは、裏側で Hibernate（JPA 実装）が、メソッド名などから判断して適切な SQL を自動生成してくれているからです。

ポイント：`JpaRepository`は、JPA という仕様に準拠した ORM（主に Hibernate）と連携することを前提としています。

---

## 3. MyBatis との連携

MyBatis は、JPA とは異なる思想を持つ ORM（正確には SQL マッパーフレームワーク）です。

- `MyBatis` の思想: SQL はプログラマが完全にコントロールすべき。Java オブジェクトと SQL のパラメータや結果セットのマッピングを自動化することに注力する。
- JPA/Hibernate との違い: Hibernate が SQL を自動生成するのに対し、MyBatis では基本的にプログラマが自分で SQL を書きます。

このため、JpaRepository のようにメソッド名から SQL を自動生成する仕組みは、MyBatis では直接利用できません。

**ではどうするのか？**

Spring Boot で `MyBatis` を使う場合は、通常 `mybatis-spring-boot-starter` というライブラリを使います。そして、Repository の役割を果たす Mapper インターフェースを作成します。

### 具体的な実装の違い

| 観点             | Spring Data JPA (JpaRepository)                                        | MyBatis (Mapper インターフェース)                  |
| :--------------- | :--------------------------------------------------------------------- | :------------------------------------------------- |
| `pom.xml`        | `spring-boot-starter-data-jpa`                                         | `mybatis-spring-boot-starter`                      |
| インターフェース | `public interface TodoRepository extends JpaRepository<Todo, Long> {}` | `@Mapper`<br>`public interface TodoMapper { ... }` |
| SQL の記述       | 不要（自動生成）                                                       | 必要（アノテーション or XML に記述）               |

MyBatis での Mapper インターフェースの例:

```java
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Insert;

@Mapper // このインターフェースがMyBatisのMapperであることを示す
public interface TodoMapper { // JpaRepositoryは継承しない

    @Select("SELECT id, title, due_date, completed FROM todos WHERE id = #{id}")
    Todo findById(Long id);

    @Select("SELECT id, title, due_date, completed FROM todos")
    List<Todo> findAll();

    @Insert("INSERT INTO todos (title, due_date, completed) VALUES (#{title}, #{dueDate},
      {completed})")
    void save(Todo todo);

    // ... UPDATEやDELETEのSQLも同様に記述する
}
```

または、XML ファイルに SQL を記述することもできます。

Service 層は、この TodoMapper を `@Autowired` で注入して使います。Service 層から見れば、`TodoRepository` を使っているのか `TodoMapper` を使っているのかは些細な違いであり、データアクセスの役割が抽象化されていることに変わりはありません。

---

## 4. データベースが Oracle の場合は？

データベースが H2 から Oracle に変わっても、Java のコード（Repository や Mapper）はほとんど変更する必要がありません。これが ORM を使う最大のメリットの一つです。

変更が必要なのは、主に設定ファイルです。

**`application.properties`の変更点:**

```java
# --- H2 Database (変更前) ---
# spring.datasource.url=jdbc:h2:mem:testdb
# spring.datasource.driverClassName=org.h2.Driver
# spring.datasource.username=sa
# spring.datasource.password=password
# spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# --- Oracle Database (変更後) ---
spring.datasource.url=jdbc:oracle:thin:@//<your-oracle-host>:<port>/<service-name>
spring.datasource.driverClassName=oracle.jdbc.driver.OracleDriver
spring.datasource.username=<your-username>
spring.datasource.password=<your-password>

# JPAを使う場合、Oracle用の方言を指定する
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
```

pom.xml に Oracle 用の JDBC ドライバの依存関係を追加する必要もあります。

```xml
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <scope>runtime</scope>
</dependency>
```

## まとめ

- Repository パターンは、DB や ORM 技術を問わず使える設計思想です。
- `JpaRepository`は、Spring Data JPA が提供する、JPA 仕様のための便利な実装です。SQL を自動生成します。
- `MyBatis` を使う場合は、JpaRepository は使わず、`@Mapper` アノテーションを付けたインターフェースを作成し、自分で SQL を記述します。
- データベースが Oracle に変わっても、Java コードへの影響は少なく、主に設定ファイル (`application.properties`)と JDBC ドライバを変更します。
