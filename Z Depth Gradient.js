/*
  Z Depth Gradient
    (C) あかつきみさき(みくちぃP)

  このスクリプトについて
    選択したレイヤーにカメラ距離に応じたデプスのグラデーションを適用します.

  使用方法
    スクリプトファイルの実行より実行してください.

  動作環境
    Adobe After Effects CS6以上

  バージョン情報
    2016/08/23 Ver 1.1.0 Update
      nearプロパティの追加.
      カラー4のエクスプレッションでポイント4への参照が間違っていた問題の修正.

    2016/07/21 Ver 1.0.0 Release
 */
/// <reference path="C:/Users/RUI/OneDrive/lib/aftereffects.d.ts/ae.d.ts"/>
(function () {
    var AE_Version;
    (function (AE_Version) {
        AE_Version[AE_Version["CS3"] = 8] = "CS3";
        AE_Version[AE_Version["CS4"] = 9] = "CS4";
        AE_Version[AE_Version["CS5"] = 10] = "CS5";
        AE_Version[AE_Version["CS5_5"] = 10.5] = "CS5_5";
        AE_Version[AE_Version["CS6"] = 11] = "CS6";
        AE_Version[AE_Version["CC"] = 12] = "CC";
        AE_Version[AE_Version["CC2014"] = 13] = "CC2014";
        AE_Version[AE_Version["CC2015"] = 13.5] = "CC2015";
        AE_Version[AE_Version["CC2015_3"] = 13.8] = "CC2015_3";
    })(AE_Version || (AE_Version = {}));
    var AK_Utils = (function () {
        function AK_Utils() {
        }
        AK_Utils.isSupportedVersion = function (version) {
            return (parseFloat(app.version) >= version);
        };
        AK_Utils.getActiveComp = function () {
            var item = app.project.activeItem;
            if (item && item instanceof CompItem) {
                return item;
            }
            return null;
        };
        AK_Utils.getSelectedAVLayer = function (comp) {
            var layer = [];
            for (var i = 0; i < comp.selectedLayers.length; i++) {
                if (comp.selectedLayers[i] instanceof AVLayer) {
                    layer[layer.length] = comp.selectedLayers[i];
                }
            }
            return layer;
        };
        return AK_Utils;
    }());
    var ADBE_Effect_Parade = "ADBE Effect Parade";
    var ADBE_4ColorGradient = "ADBE 4ColorGradient";
    var ADBE_Slider_Control = "ADBE Slider Control";
    var ADBE_Slider_Control_0001 = "ADBE Slider Control-0001";
    var DEFAULT_FAR_VALUE = 5000;
    var DEFAULT_NEAR_VALUE = 0;
    var supportVersion = AE_Version.CS6;
    if (!AK_Utils.isSupportedVersion(supportVersion)) {
        return 0;
    }
    var actComp = AK_Utils.getActiveComp();
    if (actComp == null) {
        return 0;
    }
    app.beginUndoGroup("Z depth Gradient");
    var selLayers = AK_Utils.getSelectedAVLayer(actComp);
    if (selLayers.length == 0) {
        selLayers[0] = actComp.layers.addSolid([0, 0, 0], "Z depth", actComp.width, actComp.height, 1.0, actComp.duration);
    }
    var actCamera = actComp.activeCamera;
    if (actCamera == null) {
        actCamera = actComp.layers.addCamera("Camera", [actComp.width / 2, actComp.height / 2]);
    }
    var gradientEffect;
    var farSlider;
    for (var i = 0; i < selLayers.length; i++) {
        selLayers[i].threeDLayer = true;
        selLayers[i].autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST;
        farSlider = selLayers[i].property(ADBE_Effect_Parade).addProperty(ADBE_Slider_Control);
        farSlider.property(ADBE_Slider_Control_0001).setValue(DEFAULT_FAR_VALUE);
        farSlider.name = "Far";
        nearSlider = selLayers[i].property(ADBE_Effect_Parade).addProperty(ADBE_Slider_Control);
        nearSlider.property(ADBE_Slider_Control_0001).setValue(DEFAULT_NEAR_VALUE);
        nearSlider.name = "Near";
        gradientEffect = selLayers[i].property(ADBE_Effect_Parade).addProperty(ADBE_4ColorGradient);
        // addPropertyで参照が外れるので再取得
        farSlider = selLayers[i].property(ADBE_Effect_Parade).property(gradientEffect.propertyIndex - 2);
        nearSlider = selLayers[i].property(ADBE_Effect_Parade).property(gradientEffect.propertyIndex - 1);
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0001").expression = "[0,0]";
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0002").expression = 'far = effect("' + farSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\nnear = effect("' + nearSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0001");\ngPosition = thisLayer.toWorld(point);\nd = length(cameraPosition, gPosition);\nf = linear(d, near, far, 1, 0);\n[f,f,f,1]';
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0003").expression = "[thisLayer.width,0]";
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0004").expression = 'far = effect("' + farSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\nnear = effect("' + nearSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0003");\ngPosition = thisLayer.toWorld(point);\nd = length(cameraPosition, gPosition);\nf = linear(d, near, far, 1, 0);\n[f,f,f,1]';
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0005").expression = "[0,thisLayer.height]";
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0006").expression = 'far = effect("' + farSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\nnear = effect("' + nearSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0005");\ngPosition = thisLayer.toWorld(point);\nd = length(cameraPosition, gPosition);\nf = linear(d, near, far, 1, 0);\n[f,f,f,1]';
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0007").expression = "[thisLayer.width,thisLayer.height]";
        selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0008").expression = 'far = effect("' + farSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\nnear = effect("' + nearSlider.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0007");\ngPosition = thisLayer.toWorld(point);\nd = length(cameraPosition, gPosition);\nf = linear(d, near, far, 1, 0);\n[f,f,f,1]';
    }
    app.endUndoGroup();
})();
