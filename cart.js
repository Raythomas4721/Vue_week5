const { createApp } = Vue;

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});



const url = "https://vue3-course-api.hexschool.io/v2/";
const path = "han113";

const productModal = {
  // 當id 有變動時取得遠端資料，並開啟 modal
  props: ["id", "addToCart", "openModal"],
  data() {
    return {
      modal: {},
      tempProduct: {},
      qty: 1,
    };
  },
  template: "#userProductModal",
  watch: {
    id() {
      console.log("productModal :", this.id);
      if (this.id) {
        axios.get(`${url}api/${path}/product/${this.id}`).then((res) => {
          console.log("單一產品:", res.data.product);
          this.tempProduct = res.data.product;
          this.modal.show();
        });
      }
    },
  },
  methods: {
    hide() {
      this.modal.hide();
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      console.log("Modal被關閉了");
      this.openModal("");
    });
  },
};

const app = createApp({
  data() {
    return {
      products: [],
      productId: "",
      cart: {},
      loadingItem: "",
      userData: {
        user: {
          email: "",
          name: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  methods: {
    getProducts() {
      axios.get(`${url}api/${path}/products/all`).then((res) => {
        this.products = res.data.products;
        console.log(res.data.products);
      });
    },
    openModal(id) {
      this.productId = id;
      console.log(`外層帶入productId:`, id);
    },
    addToCart(product_id, qty = 1) {
      const data = {
        product_id,
        qty,
      };
      axios.post(`${url}api/${path}/cart`, { data }).then((res) => {
        console.log("加入購物車", res.data);
        this.$refs.productModal.hide();
        this.getCarts();
      });
    },
    getCarts() {
      axios.get(`${url}api/${path}/cart`).then((res) => {
        console.log(res.data);
        this.cart = res.data.data;
      });
    },
    updateCartItem(item) {
      //購物車ID  產品ID
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      };
      this.loadingItem = item.id;
      axios.put(`${url}api/${path}/cart/${item.id}`, { data }).then((res) => {
        console.log("更新購物車:", res.data);
        this.cart = res.data.data;
        this.getCarts();
        this.loadingItem = "";
      });
    },
    deleteCart(item) {
      this.loadingItem = item.id;
      axios.delete(`${url}api/${path}/cart/${item.id}`).then((res) => {
        console.log("刪除購物車品項:", res.data);
        this.getCarts();
        this.loadingItem = "";
      });
    },
    deleteCartAll() {
      axios.delete(`${url}api/${path}/carts`).then((res) => {
        console.log("刪除所有購物車內容:");
        this.getCarts();
      });
    },
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
    onSubmit() {
      const data = {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      };

      axios
        .post(`${url}/api/${path}/order`, { data: this.userData })
        .then((res) => {
          console.log("已建立訂單", res.data);
          this.userData = {
            user: {
              email: "",
              name: "",
              tel: "",
              address: "",
            },
            message:"",
          };
          this.getCarts();
        })

        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.getProducts();
    this.getCarts();
  },
  components: {
    productModal,
  },
});

app.component('loading', VueLoading.Component)

app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
