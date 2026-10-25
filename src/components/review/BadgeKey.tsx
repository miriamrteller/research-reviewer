// The badge key: a Base UI popover with one table of every signal, its values and its question.
import { Popover } from '@base-ui/react/popover'
import { KeyRound } from 'lucide-react'
import { buttonClass } from '../button-styles'
import { Badge } from './Badge'
import { badgeKeyRows } from './badge-key-rows'

export function BadgeKey() {
  return (
    <Popover.Root>
      <Popover.Trigger className={buttonClass('outlined', 'shrink-0')}>
        <KeyRound aria-hidden="true" className="size-4" />
        Badge key
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-30">
          <Popover.Popup className="max-h-(--available-height) w-max max-w-[calc(100vw-2rem)] overflow-auto rounded-xl bg-surface-container-high p-4 text-on-surface shadow-elevation-3 outline-none">
            <Popover.Title className="mb-3 type-title-medium">Badge key</Popover.Title>
            <table className="border-collapse text-left whitespace-nowrap type-body-medium">
              <thead className="type-label-large text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-3 py-1">
                    Signal
                  </th>
                  <th scope="col" className="px-3 py-1">
                    Values
                  </th>
                  <th scope="col" className="px-3 py-1">
                    Question it answers
                  </th>
                </tr>
              </thead>
              <tbody>
                {badgeKeyRows.map((row) => (
                  <tr key={row.signal} className="align-middle odd:bg-surface-container-highest">
                    <th scope="row" className="px-3 py-1 type-label-large">
                      {row.signal}
                    </th>
                    <td className="px-3 py-1">
                      <ul className="flex gap-1" aria-label={`${row.signal} values`}>
                        {row.values.map((value) => (
                          <li key={value.label}>
                            <Badge group={row.signal} label={value.label} icon={value.icon} />
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-1 text-on-surface-variant">{row.question}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
