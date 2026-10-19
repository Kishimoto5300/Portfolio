import { useState } from 'react';
import { dishes } from './data/meals';
import type { Dish } from './types';

const tasteOptions = ['さっぱり', 'こってり', '辛い', '酸っぱい'] as const;

// 1つの献立に含める料理を、主食・主菜・副菜としてまとめた型です。
type Meal = {
  staple: Dish;
  main: Dish;
  side: Dish;
};

// 指定したカテゴリの料理だけを、meals.tsのデータから取り出します。
const dishesByCategory = (category: Dish['category']): Dish[] =>
  dishes.filter((dish) => dish.category === category);

// 献立に含まれる3品の価格を合計します。
function getMealPrice(meal: Meal): number {
  return meal.staple.price + meal.main.price + meal.side.price;
}

// 献立に含まれる3品のカロリーを合計します。
function getMealCalories(meal: Meal): number {
  return meal.staple.calorie + meal.main.calorie + meal.side.calorie;
}

// 献立に含まれる3品の調理時間を合計します。
function getMealCookTime(meal: Meal): number {
  return meal.staple.cookTime + meal.main.cookTime + meal.side.cookTime;
}

// 主食・主菜・副菜のすべての組み合わせを作ります。
function getAllMealCombinations(): Meal[] {
  return dishesByCategory('主食').flatMap((staple) =>
    dishesByCategory('主菜').flatMap((main) =>
      dishesByCategory('副菜').map((side) => ({ staple, main, side }))
    )
  );
}

// 入力された条件をすべて満たす献立から、ランダムに指定件数を選びます。
function createMeals(count = 3, budget?: number, calorieLimit?: number, cookTimeLimit?: number): Meal[] {
  const allMeals = getAllMealCombinations();
  // 各条件を設定していない場合は、その条件を判定せずに候補にします。
  const eligibleMeals = allMeals.filter((meal) =>
    (budget === undefined || getMealPrice(meal) <= budget)
    && (calorieLimit === undefined || getMealCalories(meal) <= calorieLimit)
    && (cookTimeLimit === undefined || getMealCookTime(meal) <= cookTimeLimit)
  );
  // 条件に合う献立がない場合は、候補を空にしないため全組み合わせを使います。
  const pool = eligibleMeals.length > 0 ? eligibleMeals : allMeals;

  // Math.random()で候補の位置をランダムに選び、献立を作成します。
  return Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]);
}

// 文字列で入力された数値を、計算に使えるnumber型へ変換します。
function parseLimit(value: string): number | undefined {
  const parsed = Number(value.replace(/,/g, '').trim());
  return value.trim() === '' || !Number.isFinite(parsed) || parsed < 0 ? undefined : parsed;
}

// 献立カード1枚分を表示するコンポーネントです。
function MealCard({ meal, number }: { meal: Meal; number: number }): JSX.Element {
  const items = [meal.staple, meal.main, meal.side];
  // 画面に表示するため、選ばれた3品の合計値を計算します。
  const totalPrice = items.reduce((total, dish) => total + dish.price, 0);
  const totalCalories = items.reduce((total, dish) => total + dish.calorie, 0);
  const totalCookTime = items.reduce((total, dish) => total + dish.cookTime, 0);

  return (
    <article className="meal-card">
      <div className="meal-card-heading">
        <span className="candidate-number">{String(number).padStart(2, '0')}</span>
        <h3>{meal.main.name}定食</h3>
        <span className="favorite-mark" aria-hidden="true">♡</span>
      </div>
      <div className="meal-details">
        <div className="dish-row"><span className="dish-label">主食</span><span className="dish-value">{meal.staple.name}</span></div>
        <div className="dish-row"><span className="dish-label">主菜</span><span className="dish-value">{meal.main.name}</span></div>
        <div className="dish-row"><span className="dish-label">副菜</span><span className="dish-value">{meal.side.name}</span></div>
      </div>
      <div className="meal-summary">
        <span>合計 <strong>¥{totalPrice.toLocaleString()}</strong></span>
        <span>{totalCalories} kcal</span>
        <span>調理 {totalCookTime} 分</span>
      </div>
    </article>
  );
}

function App(): JSX.Element {
  // 画面に表示する献立をstateで管理します。生成ボタンで内容が更新されます。
  const [meals, setMeals] = useState<Meal[]>(() => createMeals(3, 1000, 800, 30));
  // 入力欄の値もstateで管理し、入力内容を常に画面へ反映します。
  const [budget, setBudget] = useState('1000');
  const [calorieLimit, setCalorieLimit] = useState('800');
  const [cookTime, setCookTime] = useState('30');
  const [selectedTastes, setSelectedTastes] = useState<string[]>(['さっぱり']);

  // 味のチェックボックスが押されたら、選択状態を追加または削除します。
  const toggleTaste = (taste: string): void => {
    setSelectedTastes((current) => current.includes(taste)
      ? current.filter((item) => item !== taste)
      : [...current, taste]);
  };

  // 「条件をクリア」ボタンで、入力欄と味の選択を初期化します。
  const clearConditions = (): void => {
    setBudget('');
    setCalorieLimit('');
    setCookTime('');
    setSelectedTastes([]);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">✦</div>
        <div><p className="eyebrow">MEAL PLANNER</p><h1>今日の献立ジェネレーター</h1><p className="header-description">好みや条件に合わせて、毎日の献立をかんたんに。</p></div>
      </header>
      <div className="content-grid">
        <section className="panel conditions-panel" aria-labelledby="conditions-title">
          <div className="section-heading"><span className="step-badge">01</span><div><p className="section-kicker">START HERE</p><h2 id="conditions-title">条件を入力</h2></div></div>
          <div className="condition-fields">
            <label className="field-group"><span>予算</span><div className="input-with-unit"><input type="text" inputMode="numeric" pattern="[0-9]*" value={budget} onChange={(event) => setBudget(event.target.value.replace(/\D/g, ''))} aria-label="予算" /><span>円</span></div></label>
            <label className="field-group"><span>カロリー</span><div className="input-with-unit"><input type="text" inputMode="numeric" pattern="[0-9]*" value={calorieLimit} onChange={(event) => setCalorieLimit(event.target.value.replace(/\D/g, ''))} aria-label="カロリー" /><span>kcal以内</span></div></label>
            <label className="field-group"><span>調理時間</span><div className="input-with-unit"><input type="text" inputMode="numeric" pattern="[0-9]*" value={cookTime} onChange={(event) => setCookTime(event.target.value.replace(/\D/g, ''))} aria-label="調理時間" /><span>分以内</span></div></label>
            <fieldset className="field-group taste-group"><legend>好きな味</legend><div className="taste-options">{tasteOptions.map((taste) => <label className="taste-option" key={taste}><input type="checkbox" checked={selectedTastes.includes(taste)} onChange={() => toggleTaste(taste)} /><span>{taste}</span></label>)}</div></fieldset>
          </div>
          <div className="panel-actions"><button className="primary-button" type="button" onClick={() => setMeals(createMeals(3, parseLimit(budget), parseLimit(calorieLimit), parseLimit(cookTime)))}><span aria-hidden="true">✦</span> 献立を生成する</button><button className="secondary-button" type="button" onClick={clearConditions}>条件をクリア</button></div>
        </section>
        <section className="panel results-panel" aria-labelledby="results-title">
          <div className="section-heading"><span className="step-badge result-badge">02</span><div><p className="section-kicker">YOUR RESULTS</p><h2 id="results-title">作成した献立</h2></div><span className="result-count">{meals.length}案</span></div>
          <div className="meal-list">{meals.map((meal, index) => <MealCard key={`${meal.main.name}-${index}`} meal={meal} number={index + 1} />)}</div>
          <button className="outline-button" type="button" onClick={() => setMeals(createMeals(3, parseLimit(budget), parseLimit(calorieLimit), parseLimit(cookTime)))}>＋ もう一度候補を作成</button>
        </section>
      </div>
      <p className="footer-note">あなたの毎日に、ちょうどいい献立を。</p>
    </main>
  );
}

export default App;
