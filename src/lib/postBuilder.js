export function buildRoomPost(draft) {
  const opening = draft.audience && draft.problem
    ? `${draft.problem}で困っている${draft.audience}へ。`
    : draft.problem || `${draft.productName}を探している方へ。`
  const details = [draft.benefit, draft.proof, draft.priceHook].filter(Boolean)
  return [
    `【${draft.productName || '商品名を入力'}】`,
    opening,
    ...details,
    '気になる方は、商品ページで詳細と最新価格をチェックしてみてください。',
    draft.hashtags,
  ].filter(Boolean).join('\n\n')
}
