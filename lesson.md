# 06회차 | 클래스와 객체
> 3시간 · class · new · 생성자 · this · static · 접근 제어

## 오늘 해결할 문제
카페에는 서로 이름과 가격이 다른 음료가 여러 개 있습니다. 이름과 가격을 따로 관리하는 대신, 음료 하나를 하나의 대상으로 표현해 봅시다.

### 코드를 보기 전에 생각하기
1. 아이스티의 이름과 가격이 한 세트라면 어떤 자료형으로 묶을 수 있을까요?
2. 같은 설계도로 서로 다른 음료를 여러 개 만들 수 있을까요?
3. 모든 음료가 공통으로 사용하는 카페 이름은 어디에 두면 좋을까요?

> 먼저 말이나 그림으로 해결 방법을 설명한 뒤 코드를 입력합니다. 교사는 이 단계에서 완성 코드를 공개하지 않습니다.

## 수업 진행
| 단계 | 시간 | 활동 |
|---|---:|---|
| 문제 이해·복습 | 25분 | 현상 관찰, 해결 방법 예상 |
| 1차 실습 | 45분 | 기본 문법 직접 입력·실행 |
| 2차 실습 | 55분 | RPG와 음료 키오스크에 교차 적용 |
| 개별 확장 | 40분 | 빈칸 완성·기능 변경·오류 찾기 |
| 공유·정리 | 15분 | 자기 코드 설명, 결과 확인 |

## 실습 1. 객체 만들기
상품 클래스를 정의하고 `new`로 서로 다른 객체를 만듭니다.

**ProductDemo.java**

```java
class Product {
    String name;
    int price;
    Product(String name, int price) {
        // this.name은 이 객체의 필드를 뜻한다.
        this.name = name;
        this.price = price;
    }
}
public class ProductDemo {
    public static void main(String[] args) {
        Product tea = new Product("아이스티", 3000);
        Product choco = new Product("초코라테", 3500);
        System.out.println(tea.name + " " + tea.price);
        System.out.println(choco.name + " " + choco.price);
    }
}
```

**코드를 입력하며 확인할 점**
- 이 예제의 **파일명은 `ProductDemo.java`**입니다. (Java 공개 클래스 이름과 일치해야 합니다.)
- `new`는 클래스를 바탕으로 객체를 만듭니다.
- 생성자는 객체를 만들 때 초기 값을 설정합니다.

## 실습 2. 객체에 행동 넣기
상품이 스스로 정보를 출력하는 메서드를 만들도록 합니다.

**Shop.java**

```java
class Drink {
    String name;
    int price;
    Drink(String name, int price) {
        this.name = name;
        this.price = price;
    }
    void printInfo() {
        // TODO: 이름과 가격을 출력하세요.
    }
}
public class Shop {
    public static void main(String[] args) {
        Drink drink = new Drink("레몬에이드", 3500);
        drink.printInfo();
    }
}
```

**코드를 입력하며 확인할 점**
- 객체의 데이터는 필드, 객체의 행동은 메서드로 표현합니다.
- `drink.printInfo()`는 특정 객체의 메서드를 호출합니다.

## 실습 3. static이 필요한 이유
개별 객체의 값과 클래스 전체에서 공유하는 값을 비교합니다.

**Counter.java**

```java
class Hero {
    String name;
    int hp = 100;
    static int created = 0; // Hero 클래스에 소속된 공통 변수
    Hero(String name) {
        this.name = name;
        created++; // 새 객체를 만들 때 공유 개수를 늘린다.
    }
}
public class Counter {
    public static void main(String[] args) {
        Hero first = new Hero("전사");
        Hero second = new Hero("마법사");
        first.hp = 40;
        System.out.println(first.hp);  // 40
        System.out.println(second.hp); // 100
        System.out.println(Hero.created); // 2
    }
}
```

**코드를 입력하며 확인할 점**
- `hp`는 **객체마다 따로 존재**하지만 `created`는 **클래스에 하나만 소속**됩니다.
- `static` 메서드는 객체를 만들지 않아도 클래스 이름으로 호출할 수 있습니다. `main()`과 `Math.min()`이 예입니다.
- 실제 프로젝트에서는 필드를 `private`으로 숨기고 메서드로 접근하도록 만드는 캡슐화도 사용합니다.

## 학생 도전 과제
- [ ] `Shop.java`의 `printInfo()` 완성하기
- [ ] 두 개의 Drink 객체를 만들고 각각 출력하기
- [ ] `Counter.java`에서 캐릭터 한 명을 더 만들면 `created`는 몇인지 예상하기

## 마무리: 오늘 설명할 수 있어야 하는 것
- 클래스와 객체의 관계
- 생성자와 `this`의 의미
- 객체 필드와 `static` 필드의 차이

---
[← 전체 목차](../README.md)
