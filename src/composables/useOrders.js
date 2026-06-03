import { useSupabase } from './useSupabase'

export function useOrders() {
  const { supabase } = useSupabase()

  const TABLE = 'orders'

  async function submitOrder(order) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        items: order.items,
        guest_count: order.guestCount,
        total_amount: order.totalAmount,
        customer_name: order.customerName || null,
        contact_type: order.contactType,
        contact_info: order.contactInfo,
        notes: order.notes || null,
        expected_time: order.expectedTime
      }])
      .select('id, created_at')
      .single()

    if (error) throw error
    return data
  }

  async function getOrders(page = 1, pageSize = 20) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { orders: data, count }
  }

  async function updateOrder(id, updates) {
    const { error } = await supabase
      .from(TABLE)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }

  async function deleteOrder(id) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return { submitOrder, getOrders, updateOrder, deleteOrder }
}
