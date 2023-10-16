import { cleanup, fireEvent, render } from '@testing-library/react';
import { RowContent } from '../components/TradeList/TradeInfo';
import { EStatus, TTrade } from '../types/trade';

beforeEach(() => {
  jest.mock('dayjs', () => jest.fn((...args) => jest.requireActual('dayjs')(args.filter((arg) => arg).length > 0 ? args : '2020-08-12')))
})
afterEach(cleanup);

it('CheckboxWithLabel changes the text after click', () => {
  const now = 123456789
  const mockTrade: TTrade & { highlighted: boolean } = {
    id: 'mockId',
    name: 'mockName',
    price: '1000',
    prevPrice: '2000',
    status: EStatus.VALID,
    symbol: 'mockSymbol',
    tradeId: 'mockTradeId',
    trader: 'mockTrader',
    createdAt: now,
    updatedAt: now,
    highlighted: false
  }
  const mockDeleteTrade = jest.fn()
  const mockToggleHighlight = jest.fn()
  const { getByText, queryByText, rerender } = render(
    <RowContent
      val={mockTrade}
      deleteTrade={mockDeleteTrade}
      isLoading={false}
      toggleHighlight={mockToggleHighlight}
    />,
  );

  expect(queryByText(/mockTrader/i)).toBeTruthy();

  fireEvent.click(getByText('...'));
  fireEvent.mouseMove(getByText('highlight'));
  fireEvent.click(getByText('highlight'));
  expect(mockToggleHighlight).toHaveBeenCalled()
  rerender(
    <RowContent
      val={{ ...mockTrade, highlighted: true }}
      deleteTrade={mockDeleteTrade}
      isLoading={false}
      toggleHighlight={mockToggleHighlight}
    />,
  )
  expect(queryByText(/^highlight$/i)).toBeNull();
  expect(getByText('revoke-highlight')).toBeTruthy();

});
