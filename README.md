библиотека, генерирующая аргументы `useQuery(q.arg(param))` с комфортным типизированным интерфейсом для синхронизации состояния сущностей между несколькими useQuery хуками

concept

1. Сущность - основная абстракция библиотеки. Это определяемая по id или сочетанию полей единица, присутствующая в разных хуках useQuery
2. Есть два вида хуков: one для получения единичных сущностей и many для получения списков
3. Одни сущности могут содержать другие
4. Новые данные, полученные через хук, обновляют те же данные в других хуках
5. Частично полученные сущности могут быть использованы как плейсхолдеры в one-хуках для улучшения ux

guide

1. Создаём config, пользуясь функциями one и many

```js
import { one, many } from "./lib";

const config = {
  // one - для хука получения сущности cluster
  cluster: one(
    // апи-функция, которая будет передаваться в useQuery (пример см в src/api.ts)
    getCluster,
    // функция, извлекающая сущность из запроса
    (res) => res.data,
    // функция обновления кэша react-query
    (x, res) => ({ data: { ...res.data, ...x } }),
    // функция создания плейсходера из сущности
    (x) => ({ data: x }),
    // функция, извлекающая id из сущности
    (x) => x.id
  ),
  // many - для хука получения списка clusters
  clusters: many(
    // апи-функция, которая будет передаваться в useQuery
    getClusters,
    // функция, извлекающая сущность из запроса
    (res) => res.data,
    // функция обновления кэша react-query
    (list) => ({ data: list })
  ),
  // one для сущности host
  host: one(
    getHost,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x }),
    (x) => x.id
  ),
};
```

2. Связываем one-сущности, заданные в config, и определяем, какие сущности содержатся в many-списках. Через reactQueryOrm создаём объект q с argFn: функциями, возвращающими аргумент для useQuery

```js
import { reactQueryOrm } from "./lib";

export const { q } = reactQueryOrm(config, {
  cluster: {
    // в поле "host" кластера содержится сущность host
    host: "host",
  },
  // итерируя список, определяем, к какой сущности относится элемент
  // и извлекаем его id
  clusters: (x) => ["cluster", x.id],
});
```

3. Подписываемся на обновления через useReactQueryOrm

```js
import { useReactQueryOrm } from "./lib";

export function App() {
  useReactQueryOrm(queryClient);
  // ...
}
```

4. Используем результаты argFn в useQuery

```js
function Component() {
  const { data: cluster } = useQuery(q.cluster(1));
  const { data: host, placeholder: hostP } = useQuery({
    ...q.host(1),
    enabled: !!cluster,
  });
}
```

обновления с накапливанием затрагивают 3 уровня вложенности связей

todo:

- улучшение тестов
- удаление сущностей
- useInfiniteQuery
- ?DeepPartial for x
