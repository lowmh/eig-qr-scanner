//layout
import { Button, Card, CardContent, Grid } from "@mui/material";

const MainPage = () => {
  return (
    <Card
      className="app"
      sx={{
        backgroundColor: "background.paper",
        display: "flex",
        gap: 2,
        marginTop: 5,
        marginLeft: 5,
      }}
    >
      <CardContent>
        <Grid container spacing={3}>
          <Grid item spacing={4}>
            <Button fullWidth variant="contained" href="/qrscanner">
              QR scanner
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MainPage;
