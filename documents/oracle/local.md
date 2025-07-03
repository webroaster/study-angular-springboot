# Oracle ローカル起動

当方 M1Mac のため、Docker Desktop と併用して Colima という仮想マシンを立てて、その中で Oracle を動かす構成で開発をする。

[参考サイト: M1,M2(ARM) MacBook に Colima で Oracle Database を手間なくインストールする](https://qiita.com/waicode/items/d67782c33b7d40052245)

## 初期設定

### Colima のインストール

```sh
brew install colima
```

バージョン確認

```sh
colima version

colima version 0.8.1
git commit: 96598cc5b64e5e9e1e64891642b91edc8ac49d16
```

### Colima 起動方法

```sh
colima start
```

一度起動すると Disk サイズを変えられないため、起動コマンドで容量を設定して起動する。

また、デフォルトでは `arch` の設定が `aarch64`（ARM）になっているため、そのままでは Oracle 本体がインストールできないので、`x86_64` アーキテクチャを指定することが重要

```sh
colima start --cpu 2 --memory 2 --disk 100 -a x86_64
```

**起動時のエラー**

`colima start ...` を実行すると以下のエラーが出た。

```sh
FATA[0000] error in config: cannot use vmType: 'qemu', error: qemu-img not found, run 'brew install qemu' to install
```

`brew install qemu` を実行する。

またエラー

```sh
❯ colima start --cpu 2 --memory 2 --disk 100 -a x86_64
WARN[0000] Failed to resolve the guest agent binary for "x86_64"  error="guest agent binary could not be found for Linux-x86_64 (Hint: try installing `lima-additional-guestagents` package)"
WARN[0000] Failed to resolve the guest agent binary for "armv7l"  error="guest agent binary could not be found for Linux-armv7l (Hint: try installing `lima-additional-guestagents` package)"
WARN[0000] Failed to resolve the guest agent binary for "ppc64le"  error="guest agent binary could not be found for Linux-ppc64le (Hint: try installing `lima-additional-guestagents` package)"
WARN[0000] Failed to resolve the guest agent binary for "riscv64"  error="guest agent binary could not be found for Linux-riscv64 (Hint: try installing `lima-additional-guestagents` package)"
WARN[0000] Failed to resolve the guest agent binary for "s390x"  error="guest agent binary could not be found for Linux-s390x (Hint: try installing `lima-additional-guestagents` package)"
INFO[0000] starting colima
INFO[0000] runtime: docker
INFO[0002] creating and starting ...                     context=vm
INFO[0002] downloading disk image ...                    context=vm
> Terminal is not available, proceeding without opening an editor
> Starting the instance "colima" with VM driver "qemu"
> guest agent binary could not be found for Linux-x86_64 (Hint: try installing `lima-additional-guestagents` package)
FATA[0026] error starting vm: error at 'creating and starting': exit status 1
```

`lima` と `lima-additional-guestagents` を `brew install` インストールして再度 `colima start` 実行

またエラー

```sh
❯ colima start --cpu 2 --memory 2 --disk 100 -a x86_64
INFO[0000] starting colima
INFO[0000] runtime: docker
INFO[0002] starting ...                                  context=vm
INFO[0066] provisioning ...                              context=docker
INFO[0073] starting ...                                  context=docker
FATA[0078] error starting docker: cannot restart, VM not previously started
```

ChatGPT より以下実行するように言われた

```sh
# 1. Colima を完全に停止・削除
colima stop
colima delete

# 2. 念のため Lima の設定も削除（Colima の裏で動作）
rm -rf ~/.lima

# 3. 最新のパッケージで再確認
brew update
brew upgrade lima colima lima-additional-guestagents
```

再度 `colima` 起動

```sh
❯ colima start --cpu 2 --memory 2 --disk 100 -a x86_64
INFO[0000] starting colima
INFO[0000] runtime: docker
INFO[0002] creating and starting ...                     context=vm
INFO[0062] provisioning ...                              context=docker
INFO[0069] starting ...                                  context=docker
INFO[0138] done
```

`colima` を起動すると `~/.colima` 配下に設定ファイルが保存され、`colima list` コマンドで ARCH が `x86_64` であれば OK

```sh
❯ colima list
PROFILE    STATUS     ARCH      CPUS    MEMORY    DISK      RUNTIME    ADDRESS
default    Running    x86_64    2       2GiB      100GiB    docker
```

### colima の Docker に Oracle コンテナを入れる

以下 2 つの方法があるらしい

1. Oracle Container Registry にあるイメージをプルしてコンテナ起動
2. Oracle が GitHub に公開している Docker ファイルと Linux 用 Oracle の rpm ファイルでコンテナ起動

`1.` の方法で試す

[こちらのサイト](https://container-registry.oracle.com/ords/f?p=113:4:108733357977733:::4:P4_REPOSITORY,AI_REPOSITORY,AI_REPOSITORY_NAME,P4_REPOSITORY_NAME,P4_EULA_ID,P4_BUSINESS_AREA_ID:803,803,Oracle%20Database%20Express%20Edition,Oracle%20Database%20Express%20Edition,1,0&cs=3I8Ju5q_adz0hOM8legEUFFbwpssU-k2UMPuxHxYuPuddVYrtulRYZQ8r8ZzB9OUCK9yPaz8CiPmV-sAuQsR20w) の最下部の Tags で `21.3.0-xe` が利用できることを確認。

`Pull Command` のコマンドを実行

```sh
docker pull container-registry.oracle.com/database/express:21.3.0-xe
```
