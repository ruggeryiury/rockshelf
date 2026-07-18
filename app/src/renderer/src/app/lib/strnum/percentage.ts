export const calculatePercentageAsString = (count: number, total: number) => (count === 0 ? '0%' : `${((count / total) * 100).toFixed().toString()}%`)
