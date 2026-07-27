import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Subscribe to postgres_changes on a table with automatic cleanup.
 * @param {Object} config
 * @param {string} config.event - INSERT, UPDATE, DELETE, or *
 * @param {string} config.schema - Database schema (default 'public')
 * @param {string} config.table - Table name
 * @param {string} config.filter - Postgres filter string (e.g. 'user_id=eq.123')
 * @param {Function} config.onInsert - Handler for INSERT events
 * @param {Function} config.onUpdate - Handler for UPDATE events
 * @param {Function} config.onChange - Handler for any change event
 * @param {boolean} config.enabled - Whether to subscribe (default true)
 */
export function useRealtimeSubscription({
  event = '*',
  schema = 'public',
  table,
  filter,
  onInsert,
  onUpdate,
  onChange,
  enabled = true,
}) {
  const onInsertRef = useRef(onInsert)
  const onUpdateRef = useRef(onUpdate)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onInsertRef.current = onInsert
    onUpdateRef.current = onUpdate
    onChangeRef.current = onChange
  }, [onInsert, onUpdate, onChange])

  useEffect(() => {
    if (!enabled || !table) return

    const channel = supabase
      .channel(`realtime-${table}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event, schema, table, ...(filter ? { filter } : {}) },
        (payload) => {
          if (onChangeRef.current) onChangeRef.current(payload)
          if (payload.eventType === 'INSERT' && onInsertRef.current) onInsertRef.current(payload)
          if (payload.eventType === 'UPDATE' && onUpdateRef.current) onUpdateRef.current(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event, schema, table, filter, enabled])
}
