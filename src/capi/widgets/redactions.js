export default {

    addWidgetToMatrix: (row, col, rows, cols, type) => ({
        nextWidgetId: {
            set: state => state.nextWidgetId + 1
        },
        widgets: {
            append: (state) => ({
                id: state.nextWidgetId,
                type: type || "Blank",
                countries: ["Ireland", "United States"],
                props: ["deathsPerM"],
                row: row,
                col: col,
                cols: cols || 6,
                rows: rows || 1,
            })
        },
    }),
    deleteWidgetFromMatrix: (xid) => ({
        widgets: {
            where: (state, item, ix, {id}) => item.id === (xid || id),
            delete: true,
        }
     }),
    addVerifiedCountryToWidget: (country) => ({
        widgets: {
            where: (state, item, ix, {id}) => item.id === id,
            select: {
                countries: {
                    append: () => country
                }
            }
        }
    }),
    deleteCountryFromWidget: (country, xid) => ({
        widgets: {
            where: (state, item, ix, {id}) => item.id === (xid || id),
            select: {
                countries: {
                    where: (state, item) => item === country,
                    delete: true
                }
            }
        }
    }),
    addPropToWidget: (prop) => ({
        widgets: {
            where: (state, item, ix, {id}) => item.id === id,
            select: {
                props: {
                    append: () => prop
                }
            }
        }
    }),
    deletePropFromWidget: (prop) => ({
        widgets: {
            where: (state, item, ix, {id}) => item.id === id,
            select: {
                props: {
                    where: (state, item) => item === prop,
                    delete: true
                }
            }
        }
    }),

    setWidgetData: (widgetData, specificId) => ({
        widgets: {
            where: (state, item, ix, {id}) => item.id === (specificId || id),
            assign: () => widgetData
        }
    }),

    insertRow: (row) => ({
        widgets: {
            where: (state, item) => item.row >= row,
            assign: (state, item) => ({row: item.row + 1})
        }
    }),

    setWidgetBeingEdited: (id) => ({
        widgetBeingConfiguredId: {
            set: () => id,
        }
    }),

    doneEditing: () => ({
        editMode: {
            set: () => "none",
        }
    }),

    setDataMode: () => ({
        editMode: {
            set: (state) => "data"
        }
    }),
    setLayoutMode: () => ({
        editMode: {
            set: (state) => "layout"
        }
    })
}
