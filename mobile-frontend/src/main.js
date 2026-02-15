import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vant 懒加载
import { 
  Button, 
  Cell, 
  CellGroup,
  Icon,
  Image as VanImage,
  Swipe, 
  SwipeItem,
  Grid, 
  GridItem,
  Tab, 
  Tabs,
  Card,
  Tag,
  Sticky,
  NavBar,
  Tabbar,
  TabbarItem,
  Search,
  PullRefresh,
  List,
  Loading,
  Empty,
  Divider,
  SubmitBar,
  Stepper,
  Checkbox,
  CheckboxGroup,
  Calendar,
  ActionSheet,
  Toast,
  Dialog,
  ImagePreview,
  Uploader,
  Rate,
  Field,
  Form,
  RadioGroup,
  Radio,
  Popup,
  Picker,
  Step,
  Steps,
  NoticeBar,
  Skeleton
} from 'vant'

const app = createApp(App)

// 使用 Vant 组件
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Icon)
app.use(VanImage)
app.use(Swipe)
app.use(SwipeItem)
app.use(Grid)
app.use(GridItem)
app.use(Tab)
app.use(Tabs)
app.use(Card)
app.use(Tag)
app.use(Sticky)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Search)
app.use(PullRefresh)
app.use(List)
app.use(Loading)
app.use(Empty)
app.use(Divider)
app.use(SubmitBar)
app.use(Stepper)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(Calendar)
app.use(ActionSheet)
app.use(Toast)
app.use(Dialog)
app.use(ImagePreview)
app.use(Uploader)
app.use(Rate)
app.use(Field)
app.use(Form)
app.use(RadioGroup)
app.use(Radio)
app.use(Popup)
app.use(Picker)
app.use(Step)
app.use(Steps)
app.use(NoticeBar)
app.use(Skeleton)

app.use(createPinia())
app.use(router)

app.mount('#app')
