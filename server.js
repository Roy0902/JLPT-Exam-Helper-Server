import {init} from './route/user_route.js'
import {app} from './config/app.js'

init()
    
app.listen(8080, () => {
    console.log(`Server listening on port 8080`);
})
