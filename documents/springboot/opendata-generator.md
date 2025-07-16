# OpenAPI Generator（DTO, API I/F ジェネレーター）

## 目的

`openapi.yaml` から Spring Boot サーバーの API インターフェース (`〇〇Api.java`) とデータ転送オブジェクト（DTO）を自動生成するために利用する。

## 導入手順と設定

OpenAPI Generator は Maven プラグインとして `pom.xml` に組み込む。ビルド時に自動的にコードが生成されるように設定。

1.  **`pom.xml` の設定**

    `openapi-generator-maven-plugin` を `build` セクションの `plugins` に追加

    ```xml
    <plugin>
        <groupId>org.openapitools</groupId>
        <artifactId>openapi-generator-maven-plugin</artifactId>
        <version>7.6.0</version>
        <executions>
            <execution>
                <id>generate-api</id>
                <goals>
                    <goal>generate</goal>
                </goals>
                <configuration>
                    <inputSpec>${project.basedir}/src/main/resources/openapi.yaml</inputSpec>
                    <generatorName>spring</generatorName>
                    <apiPackage>com.example.fidodemo.api</apiPackage>
                    <modelPackage>com.example.fidodemo.dto</modelPackage> <!-- DTOのパッケージ名 -->
                    <supportingFilesToGenerate>ApiUtil.java</supportingFilesToGenerate>
                    <configOptions>
                        <delegatePattern>true</delegatePattern>
                        <interfaceOnly>true</interfaceOnly>
                        <useTags>true</useTags>
                        <skipFormModel>true</skipFormModel>
                        <dateLibrary>java8</dateLibrary>
                        <useBeanValidation>true</useBeanValidation>
                        <performBeanValidation>true</performBeanValidation>
                        <useJakartaEe>true</useJakartaEe>
                        <hideGenerationTimestamp>true</hideGenerationTimestamp>
                    </configOptions>
                    <addCompileSourceRoot>false</addCompileSourceRoot> <!-- 生成コードを自動でコンパイル対象に含めない -->
                    <typeMappings>
                        <typeMapping>number=java.math.BigDecimal</typeMapping>
                        <typeMapping>integer=java.lang.Integer</typeMapping>
                    </typeMappings>
                </configuration>
            </execution>
        </executions>
    </plugin>
    ```

    - **`<inputSpec>`**: API 定義ファイル (`openapi.yaml`) のパスを指定
    - **`<generatorName>`**: 生成するコードのタイプを指定。ここでは Spring Boot サーバーコードを生成するため `spring` を使用
    - **`<apiPackage>`**: 生成される API インターフェースの Java パッケージ名を指定。例: `com.example.fidodemo.api`。
    - **`<modelPackage>`**: 生成されるデータモデル (DTO) の Java パッケージ名を指定。例: `com.example.fidodemo.dto`。
    - **`<supportingFilesToGenerate>`**: APIUtil.java など、サポートファイルを生成するかどうかを指定。
    - **`<configOptions>`**: ジェネレータ固有の詳細設定。例えば、`delegatePattern` (デリゲートパターンを使用するか)、`interfaceOnly` (インターフェースのみを生成するか) などがある
    - **`<addCompileSourceRoot>false</addCompileSourceRoot>`**: **重要**。生成されたコードの出力ディレクトリ (`target/generated-sources/openapi`) を Maven のコンパイル対象ソースルートに自動的に追加しないように設定。これにより、後述のコピーメカニズムと組み合わせて重複クラスエラーを防ぐ
    - **`<typeMappings>`**: OpenAPI の型を Java の特定の型にマッピングする設定。例えば、`number` を `BigDecimal` に、`integer` を `Integer` にマッピングすることで、DB の Entity との型整合性をとる役割

2.  **`maven-resources-plugin` による生成コードのコピー**

    `openapi-generator` が `target` ディレクトリに生成したコードの中から、必要な `.java` ファイルだけを `src/main/java/com/example/fidodemo` 配下にコピーするために `maven-resources-plugin` を使用。これにより、不要なファイルを Git 追跡下に置かず、かつディレクトリ階層をフラットに保つ

    ```xml
    <plugin>
        <artifactId>maven-resources-plugin</artifactId>
        <version>3.3.1</version>
        <executions>
            <execution>
                <id>copy-generated-openapi-sources</id>
                <phase>process-sources</phase> <!-- generate-sourcesの後、compileの前 -->
                <goals>
                    <goal>copy-resources</goal>
                </goals>
                <configuration>
                    <outputDirectory>${project.basedir}/src/main/java/com/example/fidodemo</outputDirectory>
                    <resources>
                        <resource>
                            <directory>${project.build.directory}/generated-sources/openapi/src/main/java/com/example/fidodemo</directory>
                            <includes>
                                <include>api/**/*.java</include>
                                <include>dto/**/*.java</include> <!-- DTOのパス -->
                            </includes>
                        </resource>
                    </resources>
                    <overwrite>true</overwrite> <!-- 常に上書き -->
                </configuration>
            </execution>
        </executions>
    </plugin>
    ```

    - **`<outputDirectory>`**: コピー先のディレクトリを指定。ここでは `src/main/java/com/example/fidodemo` を指定し、`api` と `dto` パッケージがその直下に配置されるようにしている。
    - **`<directory>`**: コピー元のディレクトリを指定。`openapi-generator` のデフォルト出力先である `target/generated-sources/openapi/src/main/java/com/example/fidodemo` を指定。
    - **`<includes>`**: コピーするファイルのパターンを指定。`api/**/*.java` と `dto/**/*.java` のみを含めることで、不要なファイルをコピー対象から除外している。
    - **`<overwrite>true</overwrite>`**: 常にファイルを上書きするように設定。

## コマンド実行

`openapi.yaml` の変更を反映してコードを自動生成するには、以下の Maven コマンドをホストマシン上で実行する。

```bash
./mvnw generate-sources
```

このコマンドは、Maven の `generate-sources` フェーズで `openapi-generator-maven-plugin` を実行し、その後 `process-sources` フェーズで `maven-resources-plugin` が生成されたファイルをコピーする。

## 特別な設定と注意点

### 1. DTO パッケージ名の変更 (`model` から `dto` へ)

当初 `model` というパッケージ名で DTO が生成されていたが、より明確な役割を示すために `dto` に変更しました。これに伴い、以下の変更が行われています。

- `pom.xml`: `openapi-generator-maven-plugin` の `<modelPackage>` を `com.example.fidodemo.dto` に変更。
- `pom.xml`: `maven-resources-plugin` の `<includes>` パターンを `dto/**/*.java` に変更。
- `src/main/resources/openapi.yaml`: `components/schemas` 内の `$ref` パスを `#/components/schemas/dto/ProductRequest` および `#/components/schemas/dto/ProductResponse` に変更。
- `src/main/resources/openapi/components/schemas/` 以下の DTO 定義ファイル (`ProductRequest.yaml`, `ProductResponse.yaml`) を `src/main/resources/openapi/components/schemas/dto/` ディレクトリに移動。
- `ProductService.java` および `ProductController.java`: インポート文を `com.example.fidodemo.dto.*` に変更。

### 2. 型マッピング (`number` -> `BigDecimal`, `integer` -> `Integer`)

データベースの Entity (`java.math.BigDecimal`, `java.lang.Integer`) との型整合性を保つため、OpenAPI の `number` 型を `java.math.BigDecimal` に、`integer` 型を `java.lang.Integer` にマッピングしています。これにより、`ProductService` での DTO と Entity 間の型変換ロジックが簡素化されます。

### 3. 自動生成コードの取り扱い

`src/main/java/com.example.fidodemo/api/` および `src/main/java/com.example.fidodemo/dto/` に配置されるコードは、**自動生成ツールによって上書きされる可能性があります。**

カスタマイズが必要な場合は、以下のいずれかの方法を検討してください。

- **ジェネレータの設定ファイルを変更する**: `openapi.yaml` を編集し、ジェネレータの出力内容を制御する。
- **生成されたコードを継承または委譲する**: 生成されたインターフェースやクラスを直接変更せず、それらを実装またはラップする形でカスタムロジックを追加する。
