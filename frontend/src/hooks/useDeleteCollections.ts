import { useEffect, useState } from "react"

const useDeleteCollection = () => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [rowsToDelete, setRowsToDelete] = useState<{data: Array<{index, dataindex}>}>( {data: []})

    useEffect( () => {
        if (rowsToDelete.data.length) {
            setOpenDeleteDialog(true)
        }
    }, [rowsToDelete])

    return {
        openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete
    }
}

export default useDeleteCollection