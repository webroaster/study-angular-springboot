# MyBatisGenerator（Entity ジェネレーター）

## 導入手順

1. **pom.xml に MyBatisGenerator の Maven プラグイン追加**

   - `mybatis-generator-maven-plugin`
     - 設定ファイルに基づいて Entity クラスや Mapper インターフェースを自動生成する
     - 設定ファイルは `mybatis-generator-config.xml` を作成

   ```xml
   <plugin>
   	<groupId>org.mybatis.generator</groupId>
   	<artifactId>mybatis-generator-maven-plugin</artifactId>
   	<version>1.4.2</version>
   	<configuration>
   		<configurationFile>${project.basedir}/src/main/resources/mybatis-generator-config.xml</configurationFile>
   		<verbose>true</verbose>
   		<overwrite>true</overwrite>
   	</configuration>
   	<dependencies>
   		<dependency>
   			<groupId>org.postgresql</groupId>
   			<artifactId>postgresql</artifactId>
   			<version>${postgresql.version}</version>
   		</dependency>
   	</dependencies>
   </plugin>
   ```

2. **MyBatisGenerator の設定ファイルを作成**

   - `mybatis-generator-config.xml`
     - `src/main/resources` に設定ファイルを作成
     - `application.properties` と `schema.sql` の内容を反映させる

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE generatorConfiguration PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN" "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

   <generatorConfiguration>
       <context id="Product" targetRuntime="MyBatis3">
           <jdbcConnection driverClass="org.postgresql.Driver"
               connectionURL="jdbc:postgresql://localhost:5432/fido_demo"
               userId="user"
               password="password">
           </jdbcConnection>

           <javaModelGenerator targetPackage="com.example.fidodemo.entity" targetProject="src/main/java">
               <property name="enableSubPackages" value="true"/>
               <property name="trimStrings" value="true"/>
           </javaModelGenerator>

           <sqlMapGenerator targetPackage="mappers" targetProject="src/main/resources">
               <property name="enableSubPackages" value="true"/>
           </sqlMapGenerator>

           <javaClientGenerator type="XMLMAPPER" targetPackage="com.example.fidodemo.mapper" targetProject="src/main/java">
               <property name="enableSubPackages" value="true"/>
           </javaClientGenerator>

           <table tableName="products" domainObjectName="Product">
           </table>
       </context>
   </generatorConfiguration>
   ```

3. **Entity クラスと Mapper 生成コマンド実行**
   - `./mvnw mybatis-generator:generate`
     - `mybatis-generator-config.xml`の設定に基づいて以下のファイルが自動生成される
     - `src/main/java/com/example/fidodemo/entity/Product.java` (Entity クラス)
     - `src/main/java/com/example/fidodemo/mapper/ProductMapper.java` (Mapper インタフェース)
     - `src/main/resources/mappers/ProductMapper.xml` (SQL マッピングファイル)
   - 実際に生成されたファイル
     - `src/main/java/com/example/fidodemo/entity/Product.java`
     - `src/main/java/com/example/fidodemo/mapper/ProductMapper.java`
     - `src/main/resources/mappers/ProductMapper.xml`
     - `src/main/java/com/example/fidodemo/entity/ProductExample.java` (クエリ条件を生成するための補助クラス)

これで、これまで OpenAPI Generator で生成していた model パッケージのクラスを DTO として、今回 MyBatis Generator で生成した entity パッケージの Product.java を DB の Entity として明確に分離できるようになりました。

## 自動生成ファイルの目的

これらのファイルは、アプリケーションの関心事を分離する「レイヤードアーキテクチャ」の考え方に基づいています。具体的には、データ構造（Entity）、データベース操作の定義（Mapper インターフェース）、SQL の実装（XML マッパー）を明確に分離することで、コードの保守性や可読性を高めることを目的としています。

### 1. `Product.java` （Entity クラス）

このファイルは、データベースの products テーブルの一行を表す Java オブジェクト（POJO）です。

- **目的**:
  - データベースのテーブル構造を Java コード内で表現するための「データコンテナ」です。テーブルのカラム（`id, name, price`）が、このクラスのフィールド（プロパティ）に対応しています。
- **使い方**:
  - データベースから取得した製品データを格納する際に使います。例えば、ID が 1 の製品を取得すると、その情報が格納された Product オブジェクトが返されます。
  - データベースに新しい製品を登録したり、既存の製品情報を更新したりする際に、この Product オブジェクトにデータをセットして Mapper に渡します。

**products テーブルのカラムに対応したフィールドと、それぞれの値を取得・設定するための getter/setter メソッドが定義**

### 2. `ProductMapper.java` (Mapper インターフェース)

このファイルは、データベースに対する操作（CRUD: Create, Read, Update, Delete）を定義する Java のインターフェースです。

- **目的**:
  - どのようなデータベース操作が可能かを定義します。ProductService のようなサービスクラスは、このインターフェースに定義されたメソッドを呼び出すことで、データベースを操作します。これにより、サービスクラスは具体的な SQL の実装を知る必要がなくなります。
- **使い方**:
  - ProductService クラスにこの ProductMapper をインジェクション（@Autowired）して利用します。例えば、`productMapper.selectByPrimaryKey(1)`のように呼び出すと、ID が 1 の製品を取得できます。

**基本的な CRUD 操作に対応するメソッド（`insert`, `selectByPrimaryKey`, `updateByPrimaryKey`, `deleteByPrimaryKey`など）が定義される**

### 3. `ProductMapper.xml` (XML マッパー)

このファイルは、`ProductMapper.java`インターフェースで定義されたメソッドと、実際の SQL 文を結びつけるための XML ファイルです。

- **目的:**
  - SQL を Java コードから分離します。SQL の変更が必要になった場合でも、Java コード（サービスクラスなど）を修正することなく、この XML ファイルだけを修正すればよいため、保守性が向上します。
- **使い方**:
  - このファイルは MyBatis フレームワークによって自動的に読み込まれ、ProductMapper インターフェースの実装として利用されます。開発者が直接このファイルを操作することは通常ありませんが、複雑な SQL（例えば JOIN 句を含むクエリなど）を書きたい場合には、このファイルを直接編集したり、新しいメソッドと SQL の組み合わせを追記したりします。

例えば、`<select id="selectByPrimaryKey" ...>` という要素の中に、`SELECT id, name, price FROM products WHERE id = #{id,jdbcType=INTEGER}`という SQL 文が記述されているのが確認できます。これにより、`ProductMapper.java`の`selectByPrimaryKey`メソッドが呼び出されると、この SQL が実行される仕組みです。

### 4. `ProductExample.java` (補助クラス)

このファイルは、MyBatis Generator の Query by Example (QBE)機能によって生成されるクラスです。主な目的は、タイプセーフ（安全）かつ動的に SQL の WHERE 句を組み立てることです。

- **目的**:
  - より複雑で柔軟な検索（例：「価格が 1000 円以上で、かつ名前に'Book'を含む製品」など）を、タイプセーフな方法で実現します。
- **使い方**:
  - `ProductExample`オブジェクトを生成し、`.createCriteria()`メソッドで条件設定用の`Criteria`オブジェクトを取得します。そして、`.andPriceGreaterThanOrEqualTo(1000)`や`.andNameLike("%Book%")`のようなメソッドをチェーンして呼び出すことで、複雑な検索条件を組み立てることができます。組み立てた`ProductExample`オブジェクトを`productMapper.selectByExample(example)`の
    ように渡して使います。

使い方例:

```java
// "name"が"Sample"で、"price"が1000より大きい製品を検索する条件
ProductExample example = new ProductExample();
example.createCriteria()
  .andNameEqualTo("Sample")
  .andPriceGreaterThan(1000);

// この`example`オブジェクトをMapperのメソッドに渡して検索を実行
List<Product> products = productMapper.selectByExample(example);
```

**`Example` という名前を変更できるか？**

基本できない（設定できそうな記事見つからず）

そのためビルド時にリネームするなどの対応で `Example` という名前を変更することで対応はできます。

## まとめ: DTO と Entity の分離

今回の作業で、以下の 2 つの役割が明確に分離されました。

- **DTO (Data Transfer Object)**: `com.example.fidodemo.model` パッケージのクラス（OpenAPI Generator が生成）
  - **役割**: Controller と Service の間、あるいは外部 API との通信でデータをやり取りするための入れ物。API の仕様（`openapi.yaml`）に依存します。バリデーションルール（`@NotNull`など）が付与されることもあります。
- **Entity**: `com.example.fidodemo.entity` パッケージのクラス（MyBatis Generator が生成）
  - **役割**: Service とデータベースの間でデータをやり取りするための入れ物。データベースのテーブル構造に依存します。

この分離により、例えば将来 API の仕様が変更されて DTO の構造が変わったとしても、データベースの Entity に影響が及ぶのを防ぐことがきます。逆もまた然りです。

## `model`（DTO）と`entity`は同じようなフィールドと`getter/setter`を持ってる？

この 2 つのクラスは、目的と責任範囲が明確に異なります。この違いを理解することが、クリーンで保守性の高いアプリケーションを設計する上で非常に重要になります。

### DTO と Entity の根本的な違い：役割分担

一言で言うと、「誰と話すための言葉か」 が違います。

- **Entity** (`com.example.fidodemo.entity.Product`): データベースと対話するための言葉です。
  - **目的**: データベースのテーブル構造を忠実に Java オブジェクトとして表現します。永続化（Persistence）層の関心事です。
  - **責任**: データベースのスキーマ（どのカラムがあり、型は何か）と一致していることに責任を持ちます。
  - **別名**: ドメインオブジェクト、永続化オブジェクト
- **DTO** (`com.example.fidodemo.model.ProductRequest`, `ProductResponse`): 外部（クライアント）と対話するための言葉です。
  - **目的**: API のリクエストやレスポンスのデータ形式を定義します。プレゼンテーション（Controller）層の関心事です。
  - **責任**: API の仕様（openapi.yaml）と一致していることに責任を持ちます。クライアントが何を送信してくるか、クライアントに何を返すかを定義します。
  - **別名**: データ転送オブジェクト (Data Transfer Object)

**なぜ、この 2 つを分けるのか？**

もし Entity をそのまま API のレスポンスとしてクライアントに返してしまうと、以下のような問題が発生する可能性があります。

1. 関心事の結合（密結合）:
   - DB スキーマの変更が API 仕様に影響する: 例えば、データベースのパフォーマンスチューニングのためにカラム名や型を変更したとします。もし Entity を直接返していると、その変更が API のレスポンス形式の変更に直結してしまい、API を利用しているクライアントの修正が必要になってしまいます。
   - API 仕様の変更が DB スキーマに影響する: 逆に、クライアントの要望で「製品名と価格を連結した `display_name` という項目が欲しい」と言われた場合、Entity に `display_name` というカラムを追加する必要が出てきてしまい、データベースの設計が歪んでしまう可能性があります。
2. セキュリティリスク:
   - Entity には、クライアントに見せるべきではない内部的な情報（例えば、管理用のフラグ、利益率など）が含まれているかもしれません。Entity をそのまま返すと、これらの不要、あるいは機密性の高い情報まで外部に漏洩してしまう危険性があります。DTO を間に挟むことで、外部に見せる情報だけを明示的に選択できます。
3. データ表現の最適化:
   - API のレスポンスとして、複数のテーブルから取得した情報を組み合わせて、一つのオブジェクトとして返したい場合があります。Entity は通常 1 テーブルに 1 対 1 で対応するため、このような表現は困難です。DTO であれば、複数の Entity から必要な情報だけを抜き出して、クライアントが使いやすい形に整形して返すことができます。

**コードではどちらを使うべきか？【レイヤーごとの使い分け】**

- **Controller (`ProductController.java`): DTO のみを扱います。**
  - リクエストを受け取る際は`@RequestBody` `ProductRequest dto`のように DTO で受け取ります。
  - レスポンスを返す際は`ResponseEntity<ProductResponse> response = ...`のように DTO を返します。
  - Controller は Entity の存在を知るべきではありません。
- **Service (`ProductService.java`): DTO と Entity の両方を扱い、その変換（マッピング） を行います。**
  - Controller から DTO を受け取ります。
  - 受け取った DTO を Entity に変換します。
  - Mapper（後述）を呼び出して、Entity をデータベースに保存したり、データベースから Entity を取得したりします。
  - データベースから取得した Entity を DTO に変換します。
  - 変換した DTO を Controller に返します。
- **Mapper (`ProductMapper.java` / `xml`): Entity のみを扱います。**
  - Service から Entity を受け取り、データベースに永続化します。
  - データベースから取得したデータを Entity にマッピングして Service に返します。
  - Mapper は DTO の存在を知るべきではありません。

**まとめ**

| クラスの種類 | パッケージ | 生成ツール        | 役割                             | 使用する層      |
| ------------ | ---------- | ----------------- | -------------------------------- | --------------- |
| DTO          | ...model   | OpenAPI Generator | 外部との通信役 (API の仕様)      | Controller      |
| Entity       | ...entity  | MyBatis Generator | データベースとの通訳 (DB の構造) | Service, Mapper |

この「役割分担」の考え方を適用することで、各層が自身の責任に集中でき、変更に強く、安全で、理解しやすいアプリケーションを構築することができます。

## 作業メモ

1. MyBatis Generator の導入:
   - pom.xml に `mybatis-generator-maven-plugin` を追加
   - データベース接続情報や生成するファイルの場所を定義した `mybatis-generator-config.xml` を作成
2. Entity と Mapper の自動生成:
   - `docker-compose up -d` でデータベースを起動
   - `./mvnw mybatis-generator:generate` コマンドを実行し、`products` テーブルから `Product` (Entity)、`ProductMapper` (Mapper インターフェース)、`ProductMapper.xml` (SQL) を自動生成
3. Service 層のリファクタリング:
   - ProductService を修正し、OpenAPI 由来のクラスではなく、MyBatis Generator が生成した `ProductMapper` と `Product Entity` を使ってデータベース操作を行うように変更
   - Controller（外部）とやり取りするための DTO と、データベースとやり取りするための Entity を相互に変換するロジック（`toEntity`, `toResponse`）を実装
4. Controller 層の修正:
   - ProductService の変更に合わせて、ProductController のメソッドの引数や戻り値の型を修正
5. ビルドとデバッグ:
   - `./mvnw clean install` を実行して、変更内容をコンパイル・ビルド
   - この過程で、DTO と Entity 間のデータ型の不整合（Integer/Long, Double/BigDecimal）や、API 定義との不一致によるコンパイルエラーが何度も発生
   - `pom.xml` のジェネレータ設定、`openapi.yaml` の API 定義、そして `ProductService` の型変換ロジックを段階的に修正していくことで、すべてのエラーを解決し、最終的にビルドを成功
