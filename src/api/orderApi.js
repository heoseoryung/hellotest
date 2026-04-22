import { apiSlice } from './apiSlice'
import { setLastCreatedOrder } from '@/features/order/orderSlice'

const normalizeOrder = (o) => ({
  id: o.orderId ?? o.id,
  date: typeof o.createdAt === 'string'
    ? o.createdAt.replace('T', ' ').slice(0, 19)
    : (o.date ?? ''),
  status: o.orderStatus ?? o.status,
  ordererName: o.ordererName ?? o.buyerName ?? o.memberName ?? '',
  paymentMethod: o.paymentMethod ?? o.paymentType ?? '',
  couponDiscount: o.couponDiscountAmount ?? o.couponDiscount ?? 0,
  items: (o.orderItems ?? o.items ?? []).map((item) => ({
    productId: item.productId,
    name: item.productName ?? item.name,
    option: item.optionName ?? item.option ?? '',
    qty: item.quantity ?? item.qty ?? 1,
    price: item.price,
    img: item.imageUrl ?? item.img ?? null,
    trackingNo: item.trackingNumber ?? item.trackingNo ?? '',
    company: item.deliveryCompany ?? item.company ?? '',
    itemStatus: item.itemStatus ?? item.status ?? o.orderStatus ?? o.status ?? '',
  })),
  productPrice: o.productAmount ?? o.productPrice ?? 0,
  shippingPrice: o.shippingFee ?? o.shippingPrice ?? 0,
  discountPrice: o.discountAmount ?? o.discountPrice ?? 0,
  total: o.totalAmount ?? o.total ?? 0,
  address: {
    recipient: o.recipientName ?? o.receiver ?? '',
    zipCode: o.zipCode ?? o.postCode ?? '',
    address: o.address ?? o.roadAddress ?? '',
    phone: o.recipientPhone ?? o.receiverPhone ?? o.phone ?? '',
    memo: o.deliveryMemo ?? o.orderMemo ?? o.memo ?? '',
  },
})

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** 주문 목록 */
    getOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      transformResponse: (res) => {
        const raw = res.content ?? res.data?.content ?? []
        return {
          content: raw.map(normalizeOrder),
          totalPages: res.totalPages ?? res.data?.totalPages ?? 1,
          totalElements: res.totalElements ?? res.data?.totalElements ?? raw.length,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Order', id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    /** 주문 상세 */
    getOrderById: builder.query({
      query: (orderId) => ({ url: `/orders/${orderId}` }),
      transformResponse: (res) => normalizeOrder(res.data ?? res),
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    /** 주문 생성 — 완료 후 lastCreatedOrder 저장 */
    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setLastCreatedOrder(data))
        } catch {}
      },
    }),

    /** 주문 취소 */
    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Order', id: orderId }],
    }),

    /** 환불 요청 */
    refundOrder: builder.mutation({
      query: ({ orderId, body }) => ({
        url: `/orders/${orderId}/refund`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Order', id: orderId }],
    }),

    /** TossPayments 결제 승인 — paymentKey·orderId·amount 전송 */
    confirmPayment: builder.mutation({
      query: (body) => ({ url: '/payments/confirm', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useConfirmPaymentMutation,
} = orderApi
