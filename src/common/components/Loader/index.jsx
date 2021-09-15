import React from "react";

import { CircularProgress, Backdrop } from "@mui/material";
import { makeStyles } from "@mui/styles";

const loaderStyles = makeStyles((theme) => ({
    Backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
}));

export default function Loader({ loading }) {
    //===============================================================================================================================================
    //========================================== Renders ============================================================================================
    //===============================================================================================================================================
    const classes = loaderStyles();
    return (
        <Backdrop
            className={classes.Backdrop}
            open={typeof loading === "boolean" ? loading : true}
        >
            <CircularProgress />
        </Backdrop>
    );
}
