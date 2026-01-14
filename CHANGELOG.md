# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.2](https://github.com/miracleonyenma/untools-starter/compare/v0.5.1...v0.5.2) (2026-01-14)


### Bug Fixes

* **utils:** update API project creation to handle storage p.. ([2411a0d](https://github.com/miracleonyenma/untools-starter/commit/2411a0d38e9d07a3bea3d7dc21f5ccdb69d21b22))

### [0.5.1](https://github.com/miracleonyenma/untools-starter/compare/v0.5.0...v0.5.1) (2026-01-13)


### Features

* **utils:** add storage configuration to api project creation ([9ca7734](https://github.com/miracleonyenma/untools-starter/commit/9ca7734e933e53bbfca57943fa6e32c5c9085939))

## [0.5.0](https://github.com/miracleonyenma/untools-starter/compare/v0.4.4...v0.5.0) (2025-12-01)


### Features

* Introduce database selection (MongoDB or PostgreSQL) with optional Docker support, replacing specific MongoDB options. ([b3607e9](https://github.com/miracleonyenma/untools-starter/commit/b3607e988528dcea52e00446eba3f3bd7a0a7b0f))

### [0.4.4](https://github.com/miracleonyenma/untools-starter/compare/v0.4.2...v0.4.4) (2025-10-27)


### Features

* **project:** Support creating projects in current directory ([7bfe327](https://github.com/miracleonyenma/untools-starter/commit/7bfe327a54050b557248538610638da578cd91fa))

### [0.4.2](https://github.com/miracleonyenma/untools-starter/compare/v0.4.1...v0.4.2) (2025-10-04)


### Bug Fixes

* remove .kiro directory when creating api project ([8bc009e](https://github.com/miracleonyenma/untools-starter/commit/8bc009ef372c0b753faf7c9aa6b0150032c6b68d))

## [0.4.0](https://github.com/miracleonyenma/untools-starter/compare/v0.3.0...v0.4.0) (2025-06-15)


### Features

* enhance Docker support with development and production configurations, including MongoDB initialization ([a6fd860](https://github.com/miracleonyenma/untools-starter/commit/a6fd860286e9179d95148c100cf8c8a815e91889))

## [0.3.0](https://github.com/miracleonyenma/untools-starter/compare/v0.2.3...v0.3.0) (2025-06-15)


### Features

* add MongoDB Docker option and enhance project setup ([89e9c52](https://github.com/miracleonyenma/untools-starter/commit/89e9c52bf609163b926b717c1696efc39c9b6563))

### [0.2.3](https://github.com/miracleonyenma/untools-starter/compare/v0.2.2...v0.2.3) (2025-04-19)


### Documentation

* enhance README with detailed project features and installation instructions ([2951a05](https://github.com/miracleonyenma/untools-starter/commit/2951a05f2f5c53681e059968e1c3f449562ee291))
* update acknowledgements and project inspiration in README ([5eee613](https://github.com/miracleonyenma/untools-starter/commit/5eee613ac3c3cabdf9a44ce0c0decbecd3fe1fcf))

### [0.2.2](https://github.com/miracleonyenma/untools-starter/compare/v0.2.1...v0.2.2) (2025-04-19)

### 0.2.1 (2025-04-19)


### Features

* add feature selection and auto-generated security to CLI ([30d24fa](https://github.com/miracleonyenma/untools-starter/commit/30d24fa6b998a3ae1e5563b407e6e8e99340d09f))
* add smart port assignment using @untools/port-gen ([99374f4](https://github.com/miracleonyenma/untools-starter/commit/99374f4f744f563eb335abb76ff3412f2a0cefcb))
* initialize project with essential configuration files ([bb0063f](https://github.com/miracleonyenma/untools-starter/commit/bb0063fa6c17bc11ea02912ec3552b487d476b7a))


### Bug Fixes

* modify regex to correctly replace env ([72e9f16](https://github.com/miracleonyenma/untools-starter/commit/72e9f1648272c25a27e7971c2f7c7b9cd7e44cdd))


### Tests

* add Jest configuration and initial test file ([fcb5b78](https://github.com/miracleonyenma/untools-starter/commit/fcb5b7835884f1f21d8497d386a28769994109d0))


### Continuous Integration

* configure git and fetch-depth for semantic-release ([9ccc7be](https://github.com/miracleonyenma/untools-starter/commit/9ccc7be8a8279c4440059a8362a5803a0abfe2e0))
* update semantic release command in CI workflow ([9ad11a5](https://github.com/miracleonyenma/untools-starter/commit/9ad11a521b601994f30a01ff1ebccab0acffadc9))


### Build System

* update tsconfig and package.json configurations ([04eb20f](https://github.com/miracleonyenma/untools-starter/commit/04eb20f35d1c15fca2e27c1ab4a4727d6ab1e5ad))


### Code Refactoring

* extract env variable replacement logic into helper function ([6f54346](https://github.com/miracleonyenma/untools-starter/commit/6f543461137b1cff8c48c870cb0f54e778ae0896))
* improve readability of env file replacement code ([7ac647b](https://github.com/miracleonyenma/untools-starter/commit/7ac647b263eba8de5e4e276d68e58be225c2cb05))
* rename project from ts-graphql-api to starter ([9114533](https://github.com/miracleonyenma/untools-starter/commit/9114533f10fac0f059f02e83bf68c55935ce8c7b))


### Chores

* add project setup files and CI/CD configuration ([3227fd9](https://github.com/miracleonyenma/untools-starter/commit/3227fd9449a7b74258ed94e44e8f563ef75fe41b))
* **release:** 0.1.1 ([cdcbd62](https://github.com/miracleonyenma/untools-starter/commit/cdcbd62bde1a0490c9cb4ada0e687e5172241842))
* **release:** 0.1.2 ([c6734e5](https://github.com/miracleonyenma/untools-starter/commit/c6734e5f4a48696b8fd7d955303ad97319fd022b))
* **release:** 0.1.3 ([ea127dd](https://github.com/miracleonyenma/untools-starter/commit/ea127ddfc955c65999db818541a5292f38c19927))
* **release:** 0.1.4 ([866877a](https://github.com/miracleonyenma/untools-starter/commit/866877a362f81e337f9b0839bb9df4e9dfd9f967))
* **release:** 0.1.5 ([b4faa63](https://github.com/miracleonyenma/untools-starter/commit/b4faa63f87eca9a36f48d6610eb05b1c57b16694))
* **release:** 0.1.6 ([088d7d6](https://github.com/miracleonyenma/untools-starter/commit/088d7d6581aa14f4c486a227e5d8e0ba75e16966))
* **release:** 0.1.7 ([1b0baea](https://github.com/miracleonyenma/untools-starter/commit/1b0baeaa7eb124bfe8f7832c740ef1f889d9881b))
* **release:** 0.1.8 ([a68c05d](https://github.com/miracleonyenma/untools-starter/commit/a68c05dce8668a539cbf6ac0613d940d2c8dff21))
* **release:** 0.2.0 ([42c1d67](https://github.com/miracleonyenma/untools-starter/commit/42c1d67ff0b253b1e3cb2aa3be37924acfeaa256))

### 0.2.0 (2025-04-19)

### Features

- add feature selection and auto-generated security to CLI ([30d24fa](https://github.com/miracleonyenma/untools-starter/commit/30d24fa6b998a3ae1e5563b407e6e8e99340d09f))
- add smart port assignment using @untools/port-gen ([99374f4](https://github.com/miracleonyenma/untools-starter/commit/99374f4f744f563eb335abb76ff3412f2a0cefcb))
- initialize project with essential configuration files ([bb0063f](https://github.com/miracleonyenma/untools-starter/commit/bb0063fa6c17bc11ea02912ec3552b487d476b7a))

### Bug Fixes

- modify regex to correctly replace env ([72e9f16](https://github.com/miracleonyenma/untools-starter/commit/72e9f1648272c25a27e7971c2f7c7b9cd7e44cdd))

### Tests

- add Jest configuration and initial test file ([fcb5b78](https://github.com/miracleonyenma/untools-starter/commit/fcb5b7835884f1f21d8497d386a28769994109d0))

### Continuous Integration

- configure git and fetch-depth for semantic-release ([9ccc7be](https://github.com/miracleonyenma/untools-starter/commit/9ccc7be8a8279c4440059a8362a5803a0abfe2e0))
- update semantic release command in CI workflow ([9ad11a5](https://github.com/miracleonyenma/untools-starter/commit/9ad11a521b601994f30a01ff1ebccab0acffadc9))

### Build System

- update tsconfig and package.json configurations ([04eb20f](https://github.com/miracleonyenma/untools-starter/commit/04eb20f35d1c15fca2e27c1ab4a4727d6ab1e5ad))

### Chores

- add project setup files and CI/CD configuration ([3227fd9](https://github.com/miracleonyenma/untools-starter/commit/3227fd9449a7b74258ed94e44e8f563ef75fe41b))
- **release:** 0.1.1 ([cdcbd62](https://github.com/miracleonyenma/untools-starter/commit/cdcbd62bde1a0490c9cb4ada0e687e5172241842))
- **release:** 0.1.2 ([c6734e5](https://github.com/miracleonyenma/untools-starter/commit/c6734e5f4a48696b8fd7d955303ad97319fd022b))
- **release:** 0.1.3 ([ea127dd](https://github.com/miracleonyenma/untools-starter/commit/ea127ddfc955c65999db818541a5292f38c19927))
- **release:** 0.1.4 ([866877a](https://github.com/miracleonyenma/untools-starter/commit/866877a362f81e337f9b0839bb9df4e9dfd9f967))
- **release:** 0.1.5 ([b4faa63](https://github.com/miracleonyenma/untools-starter/commit/b4faa63f87eca9a36f48d6610eb05b1c57b16694))
- **release:** 0.1.6 ([088d7d6](https://github.com/miracleonyenma/untools-starter/commit/088d7d6581aa14f4c486a227e5d8e0ba75e16966))
- **release:** 0.1.7 ([1b0baea](https://github.com/miracleonyenma/untools-starter/commit/1b0baeaa7eb124bfe8f7832c740ef1f889d9881b))
- **release:** 0.1.8 ([a68c05d](https://github.com/miracleonyenma/untools-starter/commit/a68c05dce8668a539cbf6ac0613d940d2c8dff21))

### Code Refactoring

- extract env variable replacement logic into helper function ([6f54346](https://github.com/miracleonyenma/untools-starter/commit/6f543461137b1cff8c48c870cb0f54e778ae0896))
- improve readability of env file replacement code ([7ac647b](https://github.com/miracleonyenma/untools-starter/commit/7ac647b263eba8de5e4e276d68e58be225c2cb05))
- rename project from ts-graphql-api to starter ([9114533](https://github.com/miracleonyenma/untools-starter/commit/9114533f10fac0f059f02e83bf68c55935ce8c7b))

### [0.1.8](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.7...v0.1.8) (2025-04-13)

### Features

- add feature selection and auto-generated security to CLI ([30d24fa](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/30d24fa6b998a3ae1e5563b407e6e8e99340d09f))

### [0.1.7](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.6...v0.1.7) (2025-04-13)

### Features

- add smart port assignment using @untools/port-gen ([99374f4](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/99374f4f744f563eb335abb76ff3412f2a0cefcb))

### [0.1.6](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.5...v0.1.6) (2025-04-11)

### Code Refactoring

- extract env variable replacement logic into helper function ([6f54346](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/6f543461137b1cff8c48c870cb0f54e778ae0896))

### [0.1.5](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.4...v0.1.5) (2025-04-11)

### Bug Fixes

- modify regex to correctly replace env ([72e9f16](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/72e9f1648272c25a27e7971c2f7c7b9cd7e44cdd))

### [0.1.4](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.3...v0.1.4) (2025-04-11)

### Code Refactoring

- improve readability of env file replacement code ([7ac647b](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/7ac647b263eba8de5e4e276d68e58be225c2cb05))

### [0.1.3](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.2...v0.1.3) (2025-04-11)

### Continuous Integration

- configure git and fetch-depth for semantic-release ([9ccc7be](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/9ccc7be8a8279c4440059a8362a5803a0abfe2e0))

### Build System

- update tsconfig and package.json configurations ([04eb20f](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/04eb20f35d1c15fca2e27c1ab4a4727d6ab1e5ad))

### [0.1.2](https://github.com/miracleonyenma/untools-ts-graphql-api/compare/v0.1.1...v0.1.2) (2025-04-11)

### Continuous Integration

- update semantic release command in CI workflow ([9ad11a5](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/9ad11a521b601994f30a01ff1ebccab0acffadc9))

### 0.1.1 (2025-04-11)

### Features

- initialize project with essential configuration files ([bb0063f](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/bb0063fa6c17bc11ea02912ec3552b487d476b7a))

### Chores

- add project setup files and CI/CD configuration ([3227fd9](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/3227fd9449a7b74258ed94e44e8f563ef75fe41b))

### Tests

- add Jest configuration and initial test file ([fcb5b78](https://github.com/miracleonyenma/untools-ts-graphql-api/commit/fcb5b7835884f1f21d8497d386a28769994109d0))

## [1.0.0] - 2025-04-11

### Added

- Initial release of @untools/ts-graphql-api
- CLI for scaffolding TypeScript Express GraphQL API projects
- Interactive prompts for project configuration
- Support for Docker configuration
